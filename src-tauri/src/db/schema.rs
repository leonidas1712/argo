// Schema for saving and reading from DB along with conversions to chat logic layer

use crate::chat::types::ArgoChatMessage;
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug)]
pub struct MessageRow {
    pub id: String,
    pub thread_id: String,
    pub role: String,
    pub content: String,
    pub timestamp: String, // Store as RFC3339 string
}

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
