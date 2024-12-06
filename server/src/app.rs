use axum::Router;
use tower_http::cors::{Any, CorsLayer};
use axum::routing::get;

use crate::handlers::{health, ws};
use crate::state::AppState;

pub async fn create_app() -> Router {
    let state = AppState::new();

    Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state)
        .layer(CorsLayer::permissive())
}
