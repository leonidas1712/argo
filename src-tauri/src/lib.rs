mod chat;
mod db;
mod err;

use chat::{insert_message, MessageRow};
use chat::{ArgoChatMessage, ChatRequest, ChatStreamEvent};
use chrono::Utc;
use db::Database;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::Manager;
use tauri::State;

use err::ArgoError;
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage, MessageRole},
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
            ChatMessageRequest::new(model, vec![input.last_message.clone().message]),
        )
        .await?;

    println!("Beginning stream:\n");

    let mut counter = 1;
    let mut assistant_response = String::new();

    while let Some(Ok(response)) = stream_res.next().await {
        let content = response.message.content;
        println!("{}: {}", counter, &content);

        assistant_response.push_str(&content);

        let chunk = ChatStreamEvent::Chunk { content };

        on_event.send(chunk)?;

        counter += 1
    }

    on_event.send(ChatStreamEvent::Done)?;

    println!("\nEnd of stream");

    // Construct user message
    let user_msg = input.last_message;
    let user_msg_row: MessageRow = user_msg.into();

    // Construct assistant message
    let assistant_chat_msg = ChatMessage::new(MessageRole::Assistant, assistant_response);
    let assistant_msg = ArgoChatMessage {
        message: assistant_chat_msg,
        timestamp: Utc::now(),
    };
    let assistant_msg_row: MessageRow = assistant_msg.into();

    // Save both msgs in one txn - so its atomic
    let mut tx = db.pool.begin().await?;
    insert_message(&mut *tx, &user_msg_row).await?;
    insert_message(&mut *tx, &assistant_msg_row).await?;
    tx.commit().await?;

    dbg!("User and assistant msg saved");

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
