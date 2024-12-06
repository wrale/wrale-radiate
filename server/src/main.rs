use std::collections::HashSet;
use std::sync::Arc;
use std::net::SocketAddr;

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use hyper::server::Server;
use tokio::sync::broadcast;
use tower_http::cors::CorsLayer;
use tracing_subscriber::fmt::format::FmtSpan;

#[derive(Debug, Clone)]
struct AppState {
    tx: broadcast::Sender<String>,
    connected_clients: Arc<tokio::sync::Mutex<HashSet<String>>>,
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
    let state = AppState {
        tx,
        connected_clients: Arc::new(tokio::sync::Mutex::new(HashSet::new())),
    };

    // Build our application with a route
    let cors = CorsLayer::very_permissive();

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .layer(cors)
        .with_state(state);

    // Run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    tracing::info!("listening on {}", addr);
    
    let server = Server::bind(&addr)
        .serve(app.into_make_service());

    if let Err(e) = server.await {
        tracing::error!("server error: {}", e);
    }
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    axum::extract::State(state): axum::extract::State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
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
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            // Broadcast received message
            if let Err(e) = tx.send(text) {
                tracing::error!("Error broadcasting message: {}", e);
                break;
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
    }
}
