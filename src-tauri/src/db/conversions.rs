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
            // Try parsing as simple datetime format with timezone
            DateTime::parse_from_str(&row.created_at, "%Y-%m-%d %H:%M:%S %z")
        })
        .map_err(|e| ArgoError::ChatError(format!("failed to parse timestamp: {}", e)))?
        .with_timezone(&Utc);

    Ok(Thread {
        id: row.id,
        name: row.name,
        created_at,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_argo_message_to_row() {
        let msg = ArgoChatMessage {
            message: ChatMessage::new(MessageRole::User, "test message".to_string()),
            timestamp: Utc::now(),
        };
        let thread_id = "test-thread";

        let row = argo_message_to_row(msg, thread_id).unwrap();

        assert_eq!(row.thread_id, thread_id);
        assert_eq!(row.content, "test message");
        assert!(row.id.len() > 0); // UUID should be non-empty
        assert!(row.role.contains("user")); // Role should be serialized as lowercase
    }

    #[test]
    fn test_row_to_argo_message_assistant() {
        let row = MessageRow {
            id: "test-id".to_string(),
            thread_id: "test-thread".to_string(),
            role: r#""assistant""#.to_string(), // Just the role string, not a JSON object
            content: "test response".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        };

        let msg = row_to_argo_message(row).unwrap();

        assert_eq!(msg.message.content, "test response");
        assert_eq!(msg.message.role, MessageRole::Assistant);
    }

    #[test]
    fn test_row_to_argo_message_user() {
        let row = MessageRow {
            id: "test-id".to_string(),
            thread_id: "test-thread".to_string(),
            role: r#""user""#.to_string(),
            content: "test question".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        };

        let msg = row_to_argo_message(row).unwrap();

        assert_eq!(msg.message.content, "test question");
        assert_eq!(msg.message.role, MessageRole::User);
    }

    #[test]
    fn test_row_to_thread() {
        let row = ThreadRow {
            id: "test-thread".to_string(),
            name: "Test Thread".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };

        let thread = row_to_thread(row).unwrap();

        assert_eq!(thread.id, "test-thread");
        assert_eq!(thread.name, "Test Thread");
        assert!(thread.created_at <= Utc::now());
    }

    #[test]
    fn test_row_to_thread_legacy_format() {
        let row = ThreadRow {
            id: "test-thread".to_string(),
            name: "Test Thread".to_string(),
            created_at: "2024-03-20 15:30:00 +0000".to_string(), // Legacy format with timezone offset
        };

        let thread = row_to_thread(row).unwrap();

        assert_eq!(thread.id, "test-thread");
        assert_eq!(thread.name, "Test Thread");
    }
}
