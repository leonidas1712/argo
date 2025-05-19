import { useMutation } from "@tanstack/react-query";
import { Channel } from "@tauri-apps/api/core";
import { 
  ChatStreamEvent, 
  ChatRequestParams, 
  ArgoChatMessage,
  ChatMessage,
   
} from "../service/types";

import { showErrorNotification } from "../service/errors";
import { sendChatRequestStream } from "../service/commands";

interface ChatMutationParams {
  // params for chat_request_stream
  params: ChatRequestParams;
  // callback to run when a chunk with content is received
  onChunk: (content: string) => void;
  // callback to run when streaming is done
  onComplete: (message: ArgoChatMessage) => void;
}

// Mutation to request with chat history and get AI response
export function useChatMutation() {
  return useMutation({
    mutationFn: async ({ params, onChunk, onComplete }: ChatMutationParams) => {
      const onEvent = new Channel<ChatStreamEvent>();
      const buffer: string[] = [];

      onEvent.onmessage = (message) => {
        switch (message.event) {
          case "chunk":
            buffer.push(message.content);
            onChunk(message.content);
            break;
          case "done":
            const responseChatMsg: ChatMessage = {
              role: "assistant",
              content: buffer.join(""),
            };

            const responseArgoMsg: ArgoChatMessage = {
              message: responseChatMsg,
              timestamp: new Date().toISOString(),
            };

            onComplete(responseArgoMsg);
            break;
        }
      };

      await sendChatRequestStream(params, onEvent);
    },
    onError: (error: Error) => {
      showErrorNotification(error);
    },
  });
}