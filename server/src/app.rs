use axum::Router;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use axum::routing::get;

use crate::handlers::{health, ws};
use crate::state::AppState;

pub fn create_app() -> Router {
    let state = AppState::new();

    // Create middleware stack
    let middleware = ServiceBuilder::new()
        .layer(CorsLayer::permissive())
        .into_inner();

    // Create router with routes and state
    Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state)
        // Add middleware stack
        .with_default_service(middleware)
}
