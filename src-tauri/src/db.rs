use std::{env, fs};

use anyhow::Result;
use sqlx::{Pool, Sqlite, SqlitePool};
use tauri::{AppHandle, Manager};

/// Database for local data backed by SQLite
#[derive(Clone, Debug)]
pub struct Database {
    pub pool: Pool<Sqlite>,
}

impl Database {
    /// Creates a new SQLite database file for Argo
    // Adapted from: https://dezoito.github.io/2025/01/01/embedding-sqlite-in-a-tauri-application.html
    pub async fn new(app_handle: &AppHandle) -> Result<Self> {
        // Get app data directory from Tauri
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .expect("failed to get app directory");

        dbg!("app_data_dir:{}", &app_dir);

        // ensure app dir created if not exists
        fs::create_dir_all(&app_dir)?;

        let db_path = app_dir.join("argo.db");

        // Set the DATABASE_URL environment variable to point to this SQLite file
        env::set_var("DATABASE_URL", format!("sqlite://{}", db_path.display()));

        // Create the db if it doesn't exist, use WAL journal mode for better concurrency
        let conn_options = sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal);

        let pool = SqlitePool::connect_with(conn_options).await?;

        // Run migrations regardless of whether the database is new
        // SQLx will track which migrations have been run
        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Database { pool })
    }
}

// State management for Tauri
// #[allow(dead_code)]
// pub struct DatabaseState(pub Pool<Sqlite>);
