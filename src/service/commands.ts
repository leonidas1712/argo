import { invoke, Channel } from '@tauri-apps/api/core';
import { Thread, ChatRequestParams, ChatStreamEvent, ArgoChatMessage } from './types';


// Non-streaming chat request
export async function sendChatRequest(params: ChatRequestParams): Promise<ArgoChatMessage> {
    return invoke('chat_request', {
        input: params
    });
}

// Streaming chat request. Returns void if no error - stream output through onEvent channel
export async function sendChatRequestStream(
    params: ChatRequestParams,
    onEvent: Channel<ChatStreamEvent>
): Promise<void> {
    return invoke('chat_request_stream', {
        input: params,
        onEvent
    });
} 

// Get list of models available in Ollama
export async function listModels(): Promise<string[]> {
    return invoke('list_models');
}

// Get list of threads
export async function getThreadList(): Promise<Thread[]> {
    console.log("Get thread list invoked");
    return invoke('get_thread_list');
}

// Get message history for a thread
export async function getMessageHistory(threadId: string | null): Promise<ArgoChatMessage[]> {
    console.log("getMessageHistory invoked");
    if (threadId === null) {
        return [];
    }
    
    return invoke('get_message_history', {
        threadId
    });
}