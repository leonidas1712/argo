// Functions for read/write of messages to DB

use super::schema::MessageRow;
use crate::err::ArgoError;
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
