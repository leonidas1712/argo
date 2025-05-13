mod err;

use err::ArgoError;
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage},
    Ollama,
};
use serde::{Deserialize, Serialize};

// pub const QWEN: &str = "qwen3:8b";
pub const LLAMA: &str = "llama3.2:3b";

/// Chat request from the frontend
#[derive(Serialize, Deserialize, Debug)]
struct ChatRequest {
    /// Model name
    model: String,
    /// History before and excluding the most recent message
    history: Vec<ChatMessage>,
    /// The most recent message (usually from the user)
    last_message: ChatMessage,
}
// Convention: every command has one argument called input = object with all params
#[tauri::command]
async fn chat_request(input: ChatRequest) -> Result<ChatMessage, ArgoError> {
    dbg!("input: {:?}", &input);

    let mut ollama = Ollama::default();

    let model = String::from(LLAMA);

    let prompt = String::from("Your name is Argo. Respond concisely to the user's requests.");

    let mut history: Vec<ChatMessage> = vec![ChatMessage::system(prompt)];

    let res = ollama
        .send_chat_messages_with_history(
            &mut history,
            ChatMessageRequest::new(model, vec![input.last_message]),
        )
        .await?;

    dbg!("history after: {:?}", &history);

    Ok(res.message)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
