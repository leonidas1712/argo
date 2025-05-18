mod chat;
mod db;
mod err;

use chat::{ArgoChatMessage, ChatRequest, ChatStreamEvent};
use chrono::Utc;
use db::Database;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::Manager;
use tauri::State;

use err::ArgoError;
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage},
    Ollama,
};

use tauri::ipc::Channel;
use tokio_stream::StreamExt;

/// Chat request without streaming
#[tauri::command]
async fn chat_request(input: ChatRequest) -> Result<ArgoChatMessage, ArgoError> {
    dbg!("input: {:?}", &input);

    let mut ollama = Ollama::default();

    let model = String::from(input.model);

    let prompt = String::from("Your name is Argo. Respond concisely to the user's requests.");

    let mut history: Vec<ChatMessage> = vec![ChatMessage::system(prompt)];
    history.extend(
        input
            .history
            .iter()
            .map(|argo_msg| argo_msg.message.clone()),
    );

    let res = ollama
        .send_chat_messages_with_history(
            &mut history,
            ChatMessageRequest::new(model, vec![input.last_message.message]),
        )
        .await?;

    dbg!("history after: {:?}", &history);

    let argo_msg = ArgoChatMessage {
        message: res.message,
        timestamp: Utc::now(),
    };

    Ok(argo_msg)
}

/// Chat request with streaming
#[tauri::command]
async fn chat_request_stream(
    input: ChatRequest,
    on_event: Channel<ChatStreamEvent>,
    db: State<'_, Database>,
) -> Result<(), ArgoError> {
    dbg!("input for streaming: {:?}", &input);
    dbg!("db: {:?}", &db);

    let row: (i64,) = sqlx::query_as("select $1")
        .bind(150_i64)
        .fetch_one(&db.pool)
        .await?;

    dbg!("row: {}", row);

    let ollama = Ollama::default();

    let model = String::from(input.model);

    let prompt = String::from("Your name is Argo. Respond concisely to the user's requests.");

    let mut history: Vec<ChatMessage> = vec![ChatMessage::system(prompt)];
    history.extend(
        input
            .history
            .iter()
            .map(|argo_msg| argo_msg.message.clone()),
    );

    let history = Arc::new(Mutex::new(history));

    let mut stream_res = ollama
        .send_chat_messages_with_history_stream(
            history,
            ChatMessageRequest::new(model, vec![input.last_message.message]),
        )
        .await?;

    println!("Beginning stream:\n");

    let mut counter = 1;

    while let Some(Ok(response)) = stream_res.next().await {
        let content = response.message.content;
        println!("{}: {}", counter, &content);

        let chunk = ChatStreamEvent::Chunk { content };

        on_event.send(chunk)?;

        counter += 1
    }

    on_event.send(ChatStreamEvent::Done)?;

    println!("\nEnd of stream");

    Ok(())
}

/// List available models in Ollama
#[tauri::command]
async fn list_models() -> Result<Vec<String>, ArgoError> {
    let ollama = Ollama::default();
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
