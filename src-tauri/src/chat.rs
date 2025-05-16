// Structs related to chat state

use chrono::{DateTime, Utc};
use ollama_rs::generation::chat::ChatMessage;
use serde::{Deserialize, Serialize};

/// Argo representation of chat messages, with extra metadata
#[derive(Serialize, Deserialize, Debug)]
pub struct ArgoChatMessage {
    pub message: ChatMessage,
    /// Input from frontend is ISO 8601 string
    pub timestamp: DateTime<Utc>,
}

/// Chat request from the frontend
#[derive(Serialize, Deserialize, Debug)]
pub struct ChatRequest {
    /// Model name
    pub model: String,
    /// History before and excluding the most recent message
    pub history: Vec<ArgoChatMessage>,
    /// The most recent message (usually from the user)
    pub last_message: ArgoChatMessage,
}

/// Event enum for streaming chat response to frontend
/// e.g {"event":"chunk","content":" today"}
#[derive(Clone, Serialize)]
#[serde(tag = "event", rename_all = "lowercase")]
pub enum ChatStreamEvent {
    Chunk { content: String },
    Done,
}
