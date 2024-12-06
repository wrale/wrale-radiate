use std::collections::HashSet;
use std::sync::Arc;
use std::net::SocketAddr;

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use axum_extra::headers::{AccessControlAllowOrigin, HeaderMapExt};
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::Value;
use tokio::sync::broadcast;
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

    // Build our application with CORS middleware
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/health", get(health_check))
        .with_state(state);

    // Run it on port 3002
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
    // Add CORS headers directly to the response
    let mut response = ws
        .on_upgrade(|socket| handle_socket(socket, state))
        .into_response();
        
    response.headers_mut().typed_insert(AccessControlAllowOrigin::ANY);
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

    // Subscribe to broadcast
    let mut rx = state.tx.subscribe();

    // Send welcome message
    let welcome_msg = serde_json::json!({
        "type": "welcome",
        "message": "Connected to Wrale Radiate",
        "client_id": client_id
    });
    
    if let Ok(msg) = serde_json::to_string(&welcome_msg) {
        if let Err(e) = sender.send(Message::Text(msg)).await {
            tracing::error!("Error sending welcome message: {}", e);
        }
    }

    // Handle incoming messages
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if let Err(e) = sender.send(Message::Text(msg)).await {
                tracing::error!("Error sending message: {}", e);
                break;
            }
        }
    });

    // Handle messages from client
    let tx = state.tx.clone();
    let client_id_clone = client_id.clone(); // Clone for the task
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
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
    });

    // Wait for either task to finish
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
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
