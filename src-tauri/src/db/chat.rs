// Functions for read/write of messages to DB

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
