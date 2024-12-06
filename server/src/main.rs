mod app;
mod handlers;
mod state;
mod websocket;

use std::net::SocketAddr;
use tracing_subscriber::fmt::format::FmtSpan;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_span_events(FmtSpan::FULL)
        .init();

    // Initialize application
    let app = app::create_app().await;

    // Run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 3002));
    tracing::info!("listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    tracing::info!("server started on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
