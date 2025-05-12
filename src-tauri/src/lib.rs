use ollama_rs::{generation::completion::request::GenerationRequest, Ollama};

// pub const QWEN: &str = "qwen3:8b";
pub const LLAMA: &str = "llama3.2:3b";

struct AppState {
    ollama: Ollama,
}

#[derive(Debug, thiserror::Error)]
enum ArgoError {
    #[error("Chat error: {0}")]
    ChatError(String),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
enum ArgoErrorKind {
    ChatError(String),
}

impl serde::Serialize for ArgoError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let err_msg = self.to_string();
        let err_kind = match self {
            Self::ChatError(_) => ArgoErrorKind::ChatError(err_msg),
        };

        err_kind.serialize(serializer)
    }
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
