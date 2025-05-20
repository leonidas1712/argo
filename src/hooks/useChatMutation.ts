import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  onDone: (message: ArgoChatMessage) => void;
  // callback to run when whole request is done without error (set thread id)
  onSuccess: (newThreadId: string) => void;
}

// Mutation to request with chat history and get AI response
export function useChatMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ params, onChunk, onDone }: ChatMutationParams) => {
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

            onDone(responseArgoMsg);
            break;
        }
      };

      const id = await sendChatRequestStream(params, onEvent);
      console.log("Received id from route:", id);
      return id;
    },
    onSuccess: async(newThreadId, variables) => {
      if (variables.params.thread_id === null) {
        console.log("Invalidating threads and setting id")
        await queryClient.invalidateQueries({ queryKey: ['threads'] });
        variables.onSuccess(newThreadId);
      }
    },
    onError: (error: Error) => {
      showErrorNotification(error);
    },
  });
}