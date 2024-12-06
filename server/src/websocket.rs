use axum::extract::ws::{Message, WebSocket};
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::Value;
use uuid::Uuid;

use crate::state::AppState;

pub async fn handle_socket(mut socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    
    // Generate unique client ID
    let client_id = Uuid::new_v4().to_string();
    tracing::info!(client_id, "Beginning WebSocket connection");
    
    // Add client to connected set
    {
        let mut clients = state.connected_clients.lock().await;
        clients.insert(client_id.clone());
        tracing::info!(client_id, "Client registered in connected set");
    }

    // Create a channel for sending messages to the WebSocket
    let (tx_socket, mut rx_socket) = tokio::sync::mpsc::channel(32);

    // Subscribe to broadcast
    let mut rx = state.tx.subscribe();

    // Send welcome message
    let welcome_msg = serde_json::json!({
        "type": "welcome",
        "message": "Connected to Wrale Radiate",
        "client_id": client_id
    });
    
    if let Ok(msg) = serde_json::to_string(&welcome_msg) {
        tracing::debug!(client_id, "Sending welcome message");
        if let Err(e) = tx_socket.send(Message::Text(msg)).await {
            tracing::error!(client_id, error = ?e, "Failed to send welcome message");
        }
    }

    // Start all tasks using a single select!
    let tx = state.tx.clone();
    let tx_socket_send = tx_socket.clone();
    let client_id_clone = client_id.clone();

    let mut tasks_complete = false;
    while !tasks_complete {
        tokio::select! {
            // Handle incoming messages from client
            msg = receiver.next() => {
                match msg {
                    Some(Ok(msg)) => {
                        match msg {
                            Message::Text(text) => {
                                tracing::debug!(client_id, text = ?text, "Received text message");
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
                                                tracing::error!(client_id, error = ?e, "Failed to broadcast message");
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        tracing::error!(client_id, error = ?e, message = ?text, "Error parsing message");
                                    }
                                }
                            }
                            Message::Ping(data) => {
                                tracing::debug!(client_id, "Received ping");
                                if let Err(e) = tx_socket_send.send(Message::Pong(data)).await {
                                    tracing::error!(client_id, error = ?e, "Failed to send pong");
                                }
                            }
                            Message::Close(reason) => {
                                tracing::info!(client_id, reason = ?reason, "Received close frame");
                                tasks_complete = true;
                            }
                            Message::Pong(_) => {
                                tracing::debug!(client_id, "Received pong");
                            }
                            other => {
                                tracing::warn!(client_id, message = ?other, "Received unexpected message type");
                            }
                        }
                    }
                    Some(Err(e)) => {
                        tracing::error!(client_id, error = ?e, "WebSocket receive error");
                        tasks_complete = true;
                    }
                    None => {
                        tracing::info!(client_id, "WebSocket stream ended");
                        tasks_complete = true;
                    }
                }
            }
            // Handle outgoing messages to client
            Some(msg) = rx_socket.recv() => {
                if let Err(e) = sender.send(msg).await {
                    tracing::error!(client_id, error = ?e, "Error sending message");
                    tasks_complete = true;
                }
            }
            // Handle broadcast messages
            Ok(msg) = rx.recv() => {
                if let Err(e) = tx_socket_send.send(Message::Text(msg)).await {
                    tracing::error!(client_id, error = ?e, "Error forwarding broadcast");
                    tasks_complete = true;
                }
            }
            // Send periodic heartbeat
            _ = tokio::time::sleep(tokio::time::Duration::from_secs(30)) => {
                tracing::debug!(client_id, "Sending heartbeat ping");
                if let Err(e) = tx_socket_send.send(Message::Ping(vec![])).await {
                    tracing::error!(client_id, error = ?e, "Error sending ping");
                    tasks_complete = true;
                }
            }
        }
    }

    // Remove client from connected set
    {
        let mut clients = state.connected_clients.lock().await;
        clients.remove(&client_id);
        tracing::info!(client_id, "Client removed from connected set");

        // Broadcast disconnect event
        let disconnect_msg = serde_json::json!({
            "type": "health",
            "displayId": client_id,
            "status": "offline",
            "timestamp": chrono::Utc::now().to_rfc3339()
        });
        if let Ok(msg) = serde_json::to_string(&disconnect_msg) {
            if let Err(e) = state.tx.send(msg) {
                tracing::error!(client_id, error = ?e, "Failed to broadcast disconnect");
            }
        }
    }

    tracing::info!(client_id, "WebSocket handler completed");
}
