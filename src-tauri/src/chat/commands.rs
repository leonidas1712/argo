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
    chat::prompt,
    db::{
        chat::{get_messages, get_threads, insert_new_thread},
        conversions::{argo_message_to_row, row_to_argo_message, row_to_thread},
        insert_message, Database, MessageRow,
    },
    err::ArgoError,
};

use super::types::{ArgoChatMessage, ChatRequest, ChatStreamEvent, Thread};

// /// Chat request without streaming
// #[tauri::command]
// pub async fn chat_request(input: ChatRequest) -> Result<ArgoChatMessage, ArgoError> {
//     let mut ollama = Ollama::default();
//     let model = String::from(input.model);
//     let prompt = String::from("Your name is Argo. Respond concisely to the user's requests.");

//     let mut history: Vec<ChatMessage> = vec![ChatMessage::system(prompt)];
//     history.extend(
//         input
//             .history
//             .iter()
//             .map(|argo_msg| argo_msg.message.clone()),
//     );

//     let res = ollama
//         .send_chat_messages_with_history(
//             &mut history,
//             ChatMessageRequest::new(model, vec![input.last_message.message]),
//         )
//         .await?;

//     let argo_msg = ArgoChatMessage {
//         message: res.message,
//         timestamp: Utc::now(),
//     };

//     Ok(argo_msg)
// }

/// Chat request with streaming. Returns thread id: either new if no thread existed for this request or the same one
#[tauri::command]
pub async fn chat_request_stream(
    input: ChatRequest,
    on_event: tauri::ipc::Channel<ChatStreamEvent>,
    db: State<'_, Database>,
) -> Result<String, ArgoError> {
    let ollama = Ollama::default();
    let model = String::from(input.model);

    // let prompt = String::from("Your name is Argo. Respond concisely to the user's requests.");
    let prompt = String::from(prompt::DEFAULT_SYSTEM_PROMPT);

    // Thread id is either the one passed in, or if DNE, we make a new thread and use that id
    let thread_id = if let Some(id) = input.thread_id {
        dbg!("got an id: {}", &id);
        id
    } else {
        dbg!("thread id was None");
        // Use user's message for thread name
        let thread_name: String = input
            .last_message
            .message
            .content
            .trim()
            .chars()
            .take(100)
            .collect();
        let new_thread = insert_new_thread(&db.pool, thread_name).await?;
        new_thread.id
    };

    let mut history: Vec<ChatMessage> = vec![ChatMessage::system(prompt)];
    history.extend(
        input
            .history
            .iter()
            .map(|argo_msg| argo_msg.message.clone()),
    );

    dbg!("input history: {:?}", &history);

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
    // let user_msg_row: MessageRow = user_msg.into();
    let user_msg_row: MessageRow = argo_message_to_row(user_msg, &thread_id)?;

    // Construct assistant message
    let assistant_chat_msg = ChatMessage::new(MessageRole::Assistant, assistant_response);
    let assistant_msg = ArgoChatMessage {
        message: assistant_chat_msg,
        timestamp: Utc::now(),
    };
    // let assistant_msg_row: MessageRow = assistant_msg.into();
    let assistant_msg_row: MessageRow = argo_message_to_row(assistant_msg, &thread_id)?;

    // Save both msgs in one txn - so its atomic
    let mut tx = db.pool.begin().await?;
    insert_message(&mut *tx, &user_msg_row).await?;
    insert_message(&mut *tx, &assistant_msg_row).await?;
    tx.commit().await?;

    Ok(thread_id)
}

/// Get message history for a thread
#[tauri::command]
pub async fn get_message_history(
    thread_id: String,
    db: State<'_, Database>,
) -> Result<Vec<ArgoChatMessage>, ArgoError> {
    dbg!("thread_id: {}", &thread_id);

    let messages = get_messages(&db.pool, thread_id).await?;

    // Turn Vec<Result<T,E>> => Result<Vec<T>, E>> automatically through collect
    // i.e if any of them are errors the wrapping result is err
    // https://stackoverflow.com/questions/63798662/how-do-i-convert-a-vecresultt-e-to-resultvect-e
    let messages: Vec<ArgoChatMessage> = messages
        .into_iter()
        .map(row_to_argo_message)
        .collect::<Result<Vec<_>, _>>()?;

    dbg!("msgs argo: {:?}", &messages);

    Ok(messages)
}

/// Get list of all threads
#[tauri::command]
pub async fn get_thread_list(db: State<'_, Database>) -> Result<Vec<Thread>, ArgoError> {
    let thread_rows = get_threads(&db.pool).await?;

    // Another way to handle Vec of results, easier to understand
    let threads: Result<Vec<Thread>, ArgoError> =
        thread_rows.into_iter().map(row_to_thread).collect();

    let threads = threads?;

    Ok(threads)
}
