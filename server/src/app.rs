use axum::Router;
use axum::routing::get;
use axum::handler::Handler;
use axum::http::Method;
use tower_http::cors::{Any, CorsLayer};

use crate::handlers::{health, ws};
use crate::state::AppState;

pub fn create_app() -> Router {
    let state = AppState::new();

    // Create our CORS-enabled router
    Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state)
        // Fallback route that always applies CORS
        .fallback(cors_handler.into_service())
}

// CORS handler for fallback routes
async fn cors_handler() -> impl axum::response::IntoResponse {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
        
    // Return response with CORS headers
    axum::http::StatusCode::OK
}
