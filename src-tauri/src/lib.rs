use ollama_rs::{generation::completion::request::GenerationRequest, Ollama};

// pub const QWEN: &str = "qwen3:8b";
pub const LLAMA: &str = "llama3.2:3b";

#[tauri::command]
async fn chat_request(name: String) -> String {
    dbg!("name: {}", &name);

    let ollama = Ollama::default();
    let model = String::from(LLAMA);

    let prompt = format!(
        "Reply to the user with a short greeting and introduce yourself. The user's name is {}.",
        name
    );

    let res = ollama.generate(GenerationRequest::new(model, prompt)).await;

    if let Ok(gen_res) = res {
        return gen_res.response;
    }

    return String::from("There was an error requesting.");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
