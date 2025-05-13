mod err;

use err::ArgoError;
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage},
    Ollama,
};

// pub const QWEN: &str = "qwen3:8b";
pub const LLAMA: &str = "llama3.2:3b";

#[tauri::command]
async fn chat_request(input: String) -> Result<ChatMessage, ArgoError> {
    dbg!("input: {}", &input);

    let mut ollama = Ollama::default();

    let model = String::from(LLAMA);

    let prompt = format!("Respond concisely to the user's input: {}", input);

    let mut history: Vec<ChatMessage> = vec![];

    let res = ollama
        .send_chat_messages_with_history(
            &mut history,
            ChatMessageRequest::new(model, vec![ChatMessage::user(prompt)]),
        )
        .await?;

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
