import { invoke } from '@tauri-apps/api/core';


export interface ChatMessage {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
}

export interface ArgoChatMessage {
    message: ChatMessage;
    // ISO 8601 datetime string
    timestamp: string;
}

// Interface for command names and their types for input, response
// Convention: every command has one argument called input = object with all params
export interface Commands {
    'chat_request': {
        input: {
            model: string;
            history: ArgoChatMessage[];
            last_message: ArgoChatMessage
        };
        response: ArgoChatMessage;
    },
    'chat_request_stream': {
        input: {
            model: string;
            history: ArgoChatMessage[];
            last_message: ArgoChatMessage
        };
        response: any
    }
}

// Function to invoke Tauri commands and receive correct type
export async function invokeCommand<T extends keyof Commands>(
    command: T,
    args: Commands[T]['input']
): Promise<Commands[T]['response']> {
    return invoke(command, {
        input: args
    });
}