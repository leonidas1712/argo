mod err;

use err::ArgoError;
use ollama_rs::{generation::completion::request::GenerationRequest, Ollama};

// pub const QWEN: &str = "qwen3:8b";
pub const LLAMA: &str = "llama3.2:3b";

struct AppState {
    ollama: Ollama,
}

#[tauri::command]
async fn chat_request(
    name: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, ArgoError> {
    dbg!("name: {}", &name);

    let ollama = &state.ollama;
    let model = String::from(LLAMA);

    let prompt = format!(
        "Reply to the user with a short greeting and introduce yourself as Argo, a helpful AI assistant. The user's name is {}.",
        name
    );

    ollama
        .generate(GenerationRequest::new(model, prompt))
        .await
        .map(|r| r.response)
        .map_err(|err| ArgoError::ChatError(err.to_string()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        ollama: Ollama::default(),
    };

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
