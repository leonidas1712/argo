// Chat commands

use std::sync::{Arc, Mutex};

use chrono::Utc;
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage, MessageRole},
    Ollama,
};
use tauri::State;
use tokio_stream::StreamExt;

use crate::{
    db::{insert_message, Database, MessageRow},
    err::ArgoError,
};

use super::types::{ArgoChatMessage, ChatRequest, ChatStreamEvent};

/// Chat request without streaming
#[tauri::command]
pub async fn chat_request(input: ChatRequest) -> Result<ArgoChatMessage, ArgoError> {
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

    let argo_msg = ArgoChatMessage {
        message: res.message,
        timestamp: Utc::now(),
    };

    Ok(argo_msg)
}

/// Chat request with streaming
#[tauri::command]
pub async fn chat_request_stream(
    input: ChatRequest,
    on_event: tauri::ipc::Channel<ChatStreamEvent>,
    db: State<'_, Database>,
) -> Result<(), ArgoError> {
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

    let mut assistant_response = String::new();

    while let Some(Ok(response)) = stream_res.next().await {
        let content = response.message.content;
        assistant_response.push_str(&content);
        let chunk = ChatStreamEvent::Chunk { content };
        on_event.send(chunk)?;
    }

    on_event.send(ChatStreamEvent::Done)?;

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

    Ok(())
}
