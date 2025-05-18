mod chat;
mod db;
mod err;

use chat::commands::{chat_request, chat_request_stream};
use tauri::Manager;

/// List available models in Ollama
#[tauri::command]
async fn list_models() -> Result<Vec<String>, err::ArgoError> {
    let ollama = ollama_rs::Ollama::default();
    let models = ollama.list_local_models().await?;
    let models: Vec<String> = models.into_iter().map(|m| m.name).collect();
    Ok(models)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle();
            let database = tauri::async_runtime::block_on(async move {
                let database = db::Database::new(&handle)
                    .await
                    .expect("Failed to initialise SQLite database");
                database
            });

            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            chat_request,
            chat_request_stream,
            list_models
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
