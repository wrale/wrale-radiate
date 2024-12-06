use axum::Router;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use axum::middleware;
use axum::routing::get;
use tower::Layer;

use crate::handlers::{health, ws};
use crate::state::AppState;

pub async fn create_app() -> axum::routing::Router {
    let state = AppState::new();

    // Create CORS middleware
    let cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);

    // Build application with middleware
    Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state)
        .layer(
            ServiceBuilder::new()
                .layer(cors)
                .into_inner()
        )
        .into_make_service()
}
