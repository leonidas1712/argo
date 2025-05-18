// Schema for saving and reading from DB along with conversions to chat logic layer

use crate::chat::types::ArgoChatMessage;
use chrono::{DateTime, Utc};
use ollama_rs::generation::chat::{ChatMessage, MessageRole};
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug)]
pub struct MessageRow {
    pub id: String,
    pub thread_id: String,
    pub role: String,
    pub content: String,
    pub timestamp: String, // Store as RFC3339 string
}

// We panic in the From implementations since normal DB ops will use the right role / timestamp
// So if we panic, DB is corrupted / inconsistent
impl From<ArgoChatMessage> for MessageRow {
    fn from(msg: ArgoChatMessage) -> Self {
        let id = Uuid::new_v4().to_string();
        let thread_id = String::from("test"); // hardcode to test for now
        let role =
            serde_json::to_string(&msg.message.role).expect("failed to serialise message role");

        MessageRow {
            id,
            thread_id,
            role,
            content: msg.message.content,
            timestamp: msg.timestamp.to_rfc3339(),
        }
    }
}

impl From<MessageRow> for ArgoChatMessage {
    fn from(value: MessageRow) -> Self {
        let role = serde_json::from_str::<MessageRole>(&value.role)
            .unwrap_or_else(|e| panic!("failed to deserialize role '{}': {}", value.role, e));

        let timestamp = DateTime::parse_from_rfc3339(&value.timestamp)
            .unwrap_or_else(|e| panic!("failed to parse timestamp '{}': {}", value.timestamp, e))
            .with_timezone(&Utc);

        ArgoChatMessage {
            message: ChatMessage::new(role, value.content),
            timestamp,
        }
    }
}
