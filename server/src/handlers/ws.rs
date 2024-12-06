use axum::{
    extract::ws::WebSocketUpgrade,
    response::{IntoResponse, Response},
    http::HeaderValue,
};
use axum_extra::headers::{AccessControlAllowOrigin, HeaderMapExt};

use crate::state::AppState;
use crate::websocket::handle_socket;

pub async fn handler(
    ws: WebSocketUpgrade,
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Response {
    tracing::info!("Received WebSocket upgrade request");
    
    let mut response = ws
        .on_upgrade(|socket| handle_socket(socket, state))
        .into_response();
        
    let headers = response.headers_mut();
    headers.typed_insert(AccessControlAllowOrigin::ANY);
    headers.insert(
        "Sec-WebSocket-Protocol",
        HeaderValue::from_static("wrale-radiate")
    );
    
    response
}
