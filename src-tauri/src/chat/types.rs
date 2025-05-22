// Types for chat logic layer

use chrono::{DateTime, Utc};
use ollama_rs::generation::chat::ChatMessage;
use serde::{Deserialize, Serialize};

/// Represents a chat thread
#[derive(Serialize, Deserialize, Debug)]
pub struct Thread {
    pub id: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

/// Argo representation of chat messages, with extra metadata
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ArgoChatMessage {
    pub message: ChatMessage,
    /// Input from frontend is ISO 8601 string
    pub timestamp: DateTime<Utc>,
}

/// Chat request from the frontend
#[derive(Serialize, Deserialize, Debug)]
pub struct ChatRequest {
    /// uuid thread ID (optional - no id means new chat request we must make an id for)
    pub thread_id: Option<String>,
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

#[cfg(test)]
mod tests {
    use super::*;
    use ollama_rs::generation::chat::MessageRole;

    #[test]
    fn test_chat_request_validation() {
        let request = ChatRequest {
            thread_id: Some("test-thread".to_string()),
            model: "llama2".to_string(),
            history: vec![ArgoChatMessage {
                message: ChatMessage::new(MessageRole::User, "Hello".to_string()),
                timestamp: Utc::now(),
            }],
            last_message: ArgoChatMessage {
                message: ChatMessage::new(MessageRole::User, "How are you?".to_string()),
                timestamp: Utc::now(),
            },
        };

        // Test serialization
        let serialized = serde_json::to_string(&request).unwrap();
        let deserialized: ChatRequest = serde_json::from_str(&serialized).unwrap();

        assert_eq!(deserialized.thread_id, request.thread_id);
        assert_eq!(deserialized.model, request.model);
        assert_eq!(deserialized.history.len(), request.history.len());
        assert_eq!(
            deserialized.last_message.message.content,
            request.last_message.message.content
        );
    }

    #[test]
    fn test_chat_stream_event_serialization() {
        // Test Chunk event
        let chunk = ChatStreamEvent::Chunk {
            content: "Hello".to_string(),
        };
        let serialized = serde_json::to_string(&chunk).unwrap();
        assert!(serialized.contains("chunk"));
        assert!(serialized.contains("Hello"));

        // Test Done event
        let done = ChatStreamEvent::Done;
        let serialized = serde_json::to_string(&done).unwrap();
        assert!(serialized.contains("done"));
    }

    #[test]
    fn test_thread_validation() {
        let thread = Thread {
            id: "test-thread".to_string(),
            name: "Test Thread".to_string(),
            created_at: Utc::now(),
        };

        // Test serialization
        let serialized = serde_json::to_string(&thread).unwrap();
        let deserialized: Thread = serde_json::from_str(&serialized).unwrap();

        assert_eq!(deserialized.id, thread.id);
        assert_eq!(deserialized.name, thread.name);
        assert!(deserialized.created_at <= Utc::now());
    }
}
