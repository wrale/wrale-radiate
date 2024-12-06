use std::collections::HashSet;
use std::sync::Arc;
use std::net::SocketAddr;

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
    http::{Method, HeaderValue},
};
use axum_extra::headers::{AccessControlAllowOrigin, HeaderMapExt};
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::Value;
use tokio::sync::{broadcast, mpsc};
use tower_http::cors::CorsLayer;
use tracing_subscriber::fmt::format::FmtSpan;

// Add middleware stack type
type SharedState = Arc<AppState>;

#[derive(Debug)]
struct AppState {
    tx: broadcast::Sender<String>,
    connected_clients: tokio::sync::Mutex<HashSet<String>>,
}

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_span_events(FmtSpan::FULL)
        .init();

    // Create broadcast channel for messages
    let (tx, _rx) = broadcast::channel(100);
    
    // Create shared state
    let state = Arc::new(AppState {
        tx,
        connected_clients: tokio::sync::Mutex::new(HashSet::new()),
    });

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(tower_http::cors::Any)
        .allow_origin(tower_http::cors::Any)
        .expose_headers(tower_http::cors::Any);

    // Build our application
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/health", get(health_check))
        .layer(cors)
        .with_state(state);

    // Run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3002));
    tracing::info!("listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    tracing::info!("server started on {}", addr);
    axum::serve(listener, app).await.unwrap();
}

async fn health_check(
    axum::extract::State(state): axum::extract::State<SharedState>,
) -> Json<Value> {
    let client_count = state.connected_clients.lock().await.len();
    Json(serde_json::json!({
        "status": "ok",
        "connected_clients": client_count,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    axum::extract::State(state): axum::extract::State<SharedState>,
) -> Response {
    // Log the upgrade request
    tracing::info!("Received WebSocket upgrade request");
    
    // Add CORS headers directly to the response
    let mut response = ws
        .on_upgrade(|socket| handle_socket(socket, state))
        .into_response();
        
    let headers = response.headers_mut();
    headers.typed_insert(AccessControlAllowOrigin::ANY);
    headers.insert(
        "Sec-WebSocket-Protocol",
        HeaderValue::from_static("wrale-radiate")
    );
    
    response
}

async fn handle_socket(socket: WebSocket, state: SharedState) {
    let (mut sender, mut receiver) = socket.split();
    
    // Generate unique client ID
    let client_id = uuid::Uuid::new_v4().to_string();
    
    // Add client to connected set
    {
        let mut clients = state.connected_clients.lock().await;
        clients.insert(client_id.clone());
        tracing::info!("Client connected: {}", client_id);
    }

    // Create a channel for sending messages to the WebSocket
    let (tx_socket, mut rx_socket) = mpsc::channel(32);

    // Subscribe to broadcast
    let mut rx = state.tx.subscribe();

    // Send welcome message
    let welcome_msg = serde_json::json!({
        "type": "welcome",
        "message": "Connected to Wrale Radiate",
        "client_id": client_id
    });
    
    if let Ok(msg) = serde_json::to_string(&welcome_msg) {
        let _ = tx_socket.send(Message::Text(msg)).await;
    }

    // Start sender task
    let send_task = tokio::spawn(async move {
        while let Some(message) = rx_socket.recv().await {
            if let Err(e) = sender.send(message).await {
                tracing::error!("Error sending message: {}", e);
                break;
            }
        }
    });

    // Start heartbeat task
    let tx_socket_heartbeat = tx_socket.clone();
    let client_id_heartbeat = client_id.clone();
    let heartbeat_task = tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
        loop {
            interval.tick().await;
            if let Err(e) = tx_socket_heartbeat.send(Message::Ping(vec![])).await {
                tracing::error!("Error sending ping to {}: {}", client_id_heartbeat, e);
                break;
            }
        }
    });

    // Start broadcast listener task
    let tx_socket_broadcast = tx_socket.clone();
    let broadcast_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if let Err(e) = tx_socket_broadcast.send(Message::Text(msg)).await {
                tracing::error!("Error forwarding broadcast: {}", e);
                break;
            }
        }
    });

    // Handle messages from client
    let tx = state.tx.clone();
    let client_id_clone = client_id.clone();
    let tx_socket_recv = tx_socket.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    match serde_json::from_str::<Value>(&text) {
                        Ok(msg) => {
                            // Add client_id to health updates
                            let msg = if msg["type"] == "health" {
                                let mut msg = msg.as_object().unwrap().clone();
                                msg.insert("displayId".to_string(), client_id_clone.clone().into());
                                serde_json::to_string(&msg)
                            } else {
                                Ok(text)
                            };

                            if let Ok(msg) = msg {
                                if let Err(e) = tx.send(msg) {
                                    tracing::error!("Error broadcasting message: {}", e);
                                    break;
                                }
                            }
                        }
                        Err(e) => {
                            tracing::error!("Error parsing message: {}", e);
                            continue;
                        }
                    }
                }
                Message::Ping(data) => {
                    if let Err(e) = tx_socket_recv.send(Message::Pong(data)).await {
                        tracing::error!("Error sending pong: {}", e);
                        break;
                    }
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // Wait for any task to finish
    tokio::select! {
        _ = send_task => {
            recv_task.abort();
            broadcast_task.abort();
            heartbeat_task.abort();
        },
        _ = recv_task => {
            send_task.abort();
            broadcast_task.abort();
            heartbeat_task.abort();
        },
        _ = broadcast_task => {
            send_task.abort();
            recv_task.abort();
            heartbeat_task.abort();
        },
        _ = heartbeat_task => {
            send_task.abort();
            recv_task.abort();
            broadcast_task.abort();
        }
    };

    // Remove client from connected set
    {
        let mut clients = state.connected_clients.lock().await;
        clients.remove(&client_id);
        tracing::info!("Client disconnected: {}", client_id);

        // Broadcast disconnect event
        let disconnect_msg = serde_json::json!({
            "type": "health",
            "displayId": client_id,
            "status": "offline",
            "timestamp": chrono::Utc::now().to_rfc3339()
        });
        if let Ok(msg) = serde_json::to_string(&disconnect_msg) {
            let _ = state.tx.send(msg);
        }
    }
}
