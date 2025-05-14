mod err;
use std::sync::Arc;
use std::sync::Mutex;

use chrono::{DateTime, Utc};

use err::ArgoError;
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage},
    Ollama,
};
use serde::{Deserialize, Serialize};
use tauri::ipc::Channel;
use tokio_stream::StreamExt;

// pub const QWEN: &str = "qwen3:8b";
pub const LLAMA: &str = "llama3.2:3b";

/// Argo representation of chat messages, with extra metadata
#[derive(Serialize, Deserialize, Debug)]
struct ArgoChatMessage {
    message: ChatMessage,
    /// Input from frontend is ISO 8601 string
    timestamp: DateTime<Utc>,
}

/// Chat request from the frontend
#[derive(Serialize, Deserialize, Debug)]
struct ChatRequest {
    /// Model name
    model: String,
    /// History before and excluding the most recent message
    history: Vec<ArgoChatMessage>,
    /// The most recent message (usually from the user)
    last_message: ArgoChatMessage,
}

// Convention: every command has one argument called input = object with all params
#[tauri::command]
async fn chat_request(input: ChatRequest) -> Result<ArgoChatMessage, ArgoError> {
    dbg!("input: {:?}", &input);

    let mut ollama = Ollama::default();

    let model = String::from(LLAMA);

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

#[derive(Clone, Serialize)]
#[serde(tag = "event")]
enum ChatStreamEvent {
    Chunk { content: String },
    Done,
}

#[tauri::command]
async fn chat_request_stream(
    input: ChatRequest,
    on_event: Channel<ChatStreamEvent>,
) -> Result<(), ArgoError> {
    dbg!("input for streaming: {:?}", &input);

    let mut ollama = Ollama::default();

    let model = String::from(LLAMA);

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_request, chat_request_stream])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
