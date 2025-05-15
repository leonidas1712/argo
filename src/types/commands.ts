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

export type ChatStreamEvent =
    | { event: 'chunk'; content: string } 
    | { event: 'done'; };

export interface ChatRequestParams {
    model: string;
    history: ArgoChatMessage[];
    last_message: ArgoChatMessage;
}

// Dedicated function for non-streaming chat request
export async function sendChatRequest(params: ChatRequestParams): Promise<ArgoChatMessage> {
    return invoke('chat_request', {
        input: params
    });
}

// Dedicated function for streaming chat request
export async function sendChatRequestStream(
    params: ChatRequestParams,
    onEvent: Channel<ChatStreamEvent>
): Promise<void> {
    return invoke('chat_request_stream', {
        input: params,
        onEvent
    });
} 