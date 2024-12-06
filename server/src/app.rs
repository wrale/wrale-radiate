use axum::Router;
use axum::routing::get;
use axum::response::IntoResponse;
use tower_http::cors::CorsLayer;

use crate::handlers::{health, ws};
use crate::state::AppState;

pub fn create_app() -> Router {
    let state = AppState::new();

    Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state)
        .fallback(handle_cors_preflight)
}

/// Handler for CORS preflight requests and 404s
async fn handle_cors_preflight() -> impl IntoResponse {
    // Return response with permissive CORS headers
    let cors = CorsLayer::permissive();
    
    // Return 204 No Content for OPTIONS, 404 for others
    ([
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "*"),
        ("Access-Control-Allow-Headers", "*")
    ], axum::http::StatusCode::NO_CONTENT)
}
