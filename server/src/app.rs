use axum::Router;
use tower_http::cors::CorsLayer;
use axum::routing::get;
use axum::http::{Method, header};

use crate::handlers::{health, ws};
use crate::state::AppState;

pub async fn create_app() -> Router {
    let state = AppState::new();

    // Configure CORS at the router level
    let cors = CorsLayer::new()
        // Allow standard methods
        .allow_methods(vec![Method::GET, Method::POST, Method::OPTIONS])
        // Allow standard headers
        .allow_headers(vec![header::CONTENT_TYPE, header::ACCEPT, header::ORIGIN])
        // Allow requests from any origin
        .allow_origin(tower_http::cors::Any)
        // Allow credentials
        .allow_credentials(true);

    // Create base router
    let router = Router::new()
        .route("/ws", get(ws::handler))
        .route("/health", get(health::handler))
        .with_state(state);

    // Apply CORS to router
    router.layer(cors)
}
