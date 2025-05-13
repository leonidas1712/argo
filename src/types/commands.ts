import { invoke } from '@tauri-apps/api/core';


export interface ChatMessage {
    role: string;
    content: string;
}

export interface Commands {
    'chat_request': {
        input: {
            input: string;
        };
        response: ChatMessage;
    }
}

// Function to invoke Tauri commands and receive correct type
export async function invokeCommand<T extends keyof Commands>(
    command: T,
    args: Commands[T]['input']
): Promise<Commands[T]['response']> {
    return invoke(command, args);
}