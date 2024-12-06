use axum::Json;
use serde_json::Value;
use crate::state::AppState;

pub async fn handler(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Json<Value> {
    let client_count = state.connected_clients.lock().await.len();
    Json(serde_json::json!({
        "status": "ok",
        "connected_clients": client_count,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}
