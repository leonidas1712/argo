// Fallible functions to convert to and from DB layer and logic layer

use crate::chat::types::{ArgoChatMessage, Thread};
use crate::db::schema::{MessageRow, ThreadRow};
use crate::err::ArgoError;
use chrono::{DateTime, Utc};
use ollama_rs::generation::chat::{ChatMessage, MessageRole};
use uuid::Uuid;

/// Convert an ArgoChatMessage to a MessageRow
pub fn argo_message_to_row(msg: ArgoChatMessage, thread_id: &str) -> Result<MessageRow, ArgoError> {
    let id = Uuid::new_v4().to_string();
    let role = serde_json::to_string(&msg.message.role)
        .map_err(|e| ArgoError::ChatError(format!("failed to serialize message role: {}", e)))?;

    Ok(MessageRow {
        id,
        thread_id: String::from(thread_id),
        role,
        content: msg.message.content,
        timestamp: msg.timestamp.to_rfc3339(),
    })
}

/// Convert a MessageRow to an ArgoChatMessage
pub fn row_to_argo_message(row: MessageRow) -> Result<ArgoChatMessage, ArgoError> {
    let role = serde_json::from_str::<MessageRole>(&row.role)
        .map_err(|e| ArgoError::ChatError(format!("failed to deserialize role: {}", e)))?;

    let timestamp = DateTime::parse_from_rfc3339(&row.timestamp)
        .map_err(|e| ArgoError::ChatError(format!("failed to parse timestamp: {}", e)))?
        .with_timezone(&Utc);

    Ok(ArgoChatMessage {
        message: ChatMessage::new(role, row.content),
        timestamp,
    })
}

/// Convert a ThreadRow (used for DB IO) to a Thread (for chat with Datetime)
pub fn row_to_thread(row: ThreadRow) -> Result<Thread, ArgoError> {
    let created_at = DateTime::parse_from_rfc3339(&row.created_at)
        .or_else(|_| {
            // Try parsing as simple datetime format
            DateTime::parse_from_str(&row.created_at, "%Y-%m-%d %H:%M:%S")
        })
        .map_err(|e| ArgoError::ChatError(format!("failed to parse timestamp: {}", e)))?
        .with_timezone(&Utc);

    Ok(Thread {
        id: row.id,
        name: row.name,
        created_at,
    })
}
