export interface Thread {
    id: string;
    name: string;
    // ISO 8601 format
    created_at: string;
}

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