use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::sync::broadcast;

#[derive(Debug, Clone)]
pub struct AppState {
    pub tx: broadcast::Sender<String>,
    pub connected_clients: Arc<Mutex<HashSet<String>>>,
}

impl AppState {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            tx,
            connected_clients: Arc::new(Mutex::new(HashSet::new())),
        }
    }
}
