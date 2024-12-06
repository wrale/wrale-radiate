use axum::Router;
use tower_http::cors::CorsLayer;
use axum::routing::get;

use crate::handlers::{health, ws};
use crate::state::AppState;

pub fn create_app() -> Router {
    let state = AppState::new();

    // Create base router with CORS pre-configured for local development
    Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state)
        // Simple CORS configuration
        .layer(CorsLayer::permissive())
}
