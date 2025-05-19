// Schema for saving and reading from DB along with conversions to chat logic layer

use crate::chat::types::{ArgoChatMessage, Thread};
use chrono::{DateTime, Utc};
use ollama_rs::generation::chat::{ChatMessage, MessageRole};
use uuid::Uuid;

// One row in messages table
#[derive(sqlx::FromRow, Debug)]
pub struct MessageRow {
    pub id: String,
    pub thread_id: String,
    pub role: String,
    pub content: String,
    pub timestamp: String, // Store as RFC3339 string
}

// One row in threads table
#[derive(sqlx::FromRow, Debug)]
pub struct ThreadRow {
    pub id: String,
    pub name: String,
    pub created_at: String, // Store as RFC3339 string
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

impl From<ThreadRow> for Thread {
    fn from(value: ThreadRow) -> Self {
        // Try RFC3339 first, then fall back to simple datetime format
        let created_at = DateTime::parse_from_rfc3339(&value.created_at)
            .or_else(|_| {
                // Try parsing as simple datetime format
                DateTime::parse_from_str(&value.created_at, "%Y-%m-%d %H:%M:%S")
            })
            .unwrap_or_else(|e| panic!("failed to parse timestamp '{}': {}", value.created_at, e))
            .with_timezone(&Utc);

        Thread {
            id: value.id,
            name: value.name,
            created_at,
        }
    }
}
