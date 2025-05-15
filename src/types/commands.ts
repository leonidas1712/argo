import { invoke, Channel } from '@tauri-apps/api/core';

export interface ChatMessage {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
}

export interface ArgoChatMessage {
    message: ChatMessage;
    // ISO 8601 format
    timestamp: string;
}

// Chat stream event for streaming request corresponding to event enum
export type ChatStreamEvent =
    | { event: 'chunk'; content: string } 
    | { event: 'done'; };

// Chat request input
export interface ChatRequestParams {
    model: string;
    history: ArgoChatMessage[];
    last_message: ArgoChatMessage;
}

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

export async function listModels(): Promise<string[]> {
    return invoke('list_models');
}