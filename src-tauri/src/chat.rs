// Structs related to chat state

use chrono::{DateTime, Utc};
use ollama_rs::generation::chat::ChatMessage;
use serde::{Deserialize, Serialize};
use sqlx::{Executor, Sqlite, SqlitePool};
use uuid::Uuid;

use crate::err::ArgoError;

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

// Structs to convert to DB format
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

/// Save one MessageRow to DB
// https://docs.rs/sqlx/latest/sqlx/trait.Executor.html
// &Pool, &mut Connection impl Executor
// Transaction and PoolConnection no Executor impls. But we can just deref when passing in
// &mut transaction -> &mut *transaction
// &mut connection -> &mut *connection
pub async fn insert_message<'e, E>(executor: E, msg: &MessageRow) -> Result<(), ArgoError>
where
    E: Executor<'e, Database = Sqlite>,
{
    sqlx::query(
        r#"
        INSERT INTO messages (id, thread_id, role, content, timestamp) 
        VALUES (?, ?, ?, ?, ?)
        "#,
    )
    .bind(&msg.id)
    .bind(&msg.thread_id)
    .bind(&msg.role)
    .bind(&msg.content)
    .bind(&msg.timestamp)
    .execute(executor)
    .await?;

    Ok(())
}

// impl From<MessageRow> for ArgoChatMessage {
//     fn from(row: MessageRow) -> Self {
//         ArgoChatMessage {
//             id: row.id,
//             thread_id: row.thread_id,
//             role: row.role,
//             content: row.content,
//             timestamp: chrono::DateTime::parse_from_rfc3339(&row.timestamp)
//                 .unwrap()
//                 .with_timezone(&chrono::Utc),
//         }
//     }
// }
