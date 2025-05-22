// Functions for read/write of chat data to DB

use crate::db::schema::{MessageRow, ThreadRow};
use crate::err::ArgoError;
use sqlx::SqlitePool;
use sqlx::{Executor, Sqlite};

/// Save one MessageRow to DB
/// https://docs.rs/sqlx/latest/sqlx/trait.Executor.html
// &Pool, &mut Connection impl Executor - trait for executing queries
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

/// Return list of messages for a thread
pub async fn get_messages<'e, E>(
    executor: E,
    thread_id: String,
) -> Result<Vec<MessageRow>, ArgoError>
where
    E: Executor<'e, Database = Sqlite>,
{
    let res = sqlx::query_as::<_, MessageRow>(
        r#"
        select * from messages where thread_id = ? order by timestamp asc;
        "#,
    )
    .bind(thread_id)
    .fetch_all(executor)
    // .execute(executor)
    .await?;

    Ok(res)
}

/// Get all threads from the database
pub async fn get_threads(pool: &SqlitePool) -> Result<Vec<ThreadRow>, sqlx::Error> {
    let threads = sqlx::query_as::<_, ThreadRow>("SELECT * FROM threads ORDER BY created_at DESC")
        .fetch_all(pool)
        .await?;

    Ok(threads)
}

/// Insert new thread with the desird name and return result
pub async fn insert_new_thread(
    pool: &SqlitePool,
    thread_name: String,
) -> Result<ThreadRow, sqlx::Error> {
    let thread_id = uuid::Uuid::new_v4().to_string();
    // ISO8601 format for easy conversion in JS side
    let created_at = chrono::Utc::now().to_rfc3339();

    let thread = sqlx::query_as::<_, ThreadRow>(
        r#"
        INSERT INTO threads (id, name, created_at)
        VALUES ($1, $2, $3)
        RETURNING id, name, created_at
        "#,
    )
    .bind(thread_id)
    .bind(thread_name)
    .bind(created_at)
    .fetch_one(pool)
    .await?;

    dbg!("new thread made: {:?}", &thread);

    Ok(thread)
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;
    use std::time::Duration;

    // Helper function to create a test database
    async fn setup_test_db() -> SqlitePool {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .acquire_timeout(Duration::from_secs(3))
            .connect("sqlite::memory:")
            .await
            .expect("Failed to create test database");

        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS threads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                thread_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (thread_id) REFERENCES threads(id)
            );
            "#,
        )
        .execute(&pool)
        .await
        .expect("Failed to create test tables");

        pool
    }

    #[tokio::test]
    async fn test_thread_operations() {
        let pool = setup_test_db().await;

        // Test creating a new thread
        let thread = insert_new_thread(&pool, "Test Thread".to_string())
            .await
            .expect("Failed to create thread");

        assert_eq!(thread.name, "Test Thread");
        assert!(!thread.id.is_empty());

        // Test getting all threads
        let threads = get_threads(&pool).await.expect("Failed to get threads");

        assert_eq!(threads.len(), 1);
        assert_eq!(threads[0].id, thread.id);
        assert_eq!(threads[0].name, thread.name);
    }

    #[tokio::test]
    async fn test_message_operations() {
        let pool = setup_test_db().await;

        // Create a thread first
        let thread = insert_new_thread(&pool, "Test Thread".to_string())
            .await
            .expect("Failed to create thread");

        // Create a test message
        let message = MessageRow {
            id: uuid::Uuid::new_v4().to_string(),
            thread_id: thread.id.clone(),
            role: r#""user""#.to_string(),
            content: "Hello, world!".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        // Test inserting a message
        insert_message(&pool, &message)
            .await
            .expect("Failed to insert message");

        // Test getting messages for the thread
        let messages = get_messages(&pool, thread.id)
            .await
            .expect("Failed to get messages");

        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].content, message.content);
        assert_eq!(messages[0].role, message.role);
    }

    #[tokio::test]
    async fn test_message_ordering() {
        let pool = setup_test_db().await;

        // Create a thread
        let thread = insert_new_thread(&pool, "Test Thread".to_string())
            .await
            .expect("Failed to create thread");

        // Create messages with different timestamps
        let message1 = MessageRow {
            id: uuid::Uuid::new_v4().to_string(),
            thread_id: thread.id.clone(),
            role: r#""user""#.to_string(),
            content: "First message".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
        };

        let message2 = MessageRow {
            id: uuid::Uuid::new_v4().to_string(),
            thread_id: thread.id.clone(),
            role: r#""user""#.to_string(),
            content: "Second message".to_string(),
            timestamp: "2024-01-02T00:00:00Z".to_string(),
        };

        // Insert messages
        insert_message(&pool, &message1)
            .await
            .expect("Failed to insert message1");
        insert_message(&pool, &message2)
            .await
            .expect("Failed to insert message2");

        // Get messages and verify order
        let messages = get_messages(&pool, thread.id)
            .await
            .expect("Failed to get messages");

        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].content, "First message");
        assert_eq!(messages[1].content, "Second message");
    }
}
