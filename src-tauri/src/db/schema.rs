// Schema for saving and reading from DB

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
