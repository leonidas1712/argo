import { Stack, ScrollArea } from "@mantine/core";
import { useEffect, useRef } from "react";
import { ArgoChatMessage } from "../types/commands";
import { formatTimestamp } from "../utils/formatTimestamp";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";

interface MessageListProps {
  history: ArgoChatMessage[];
  streamContent: string;
}

// Show list of messages along with AI streaming message
export default function MessageList({
  history,
  streamContent,
}: MessageListProps) {
  const viewport = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message or while AI is streaming, so the user sees the output
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [history, streamContent]);

  return (
    <ScrollArea mb="sm" viewportRef={viewport}>
      <Stack>
        {history.map((msg, index) => {
          const chat_msg = msg.message;
          const timeDisplay = formatTimestamp(msg.timestamp);

          if (chat_msg.role === "user") {
            return (
              <UserMessage
                key={index}
                time={timeDisplay}
                content={chat_msg.content}
              />
            );
          }
          return (
            <AIMessage
              key={index}
              time={timeDisplay}
              content={chat_msg.content}
            />
          );
        })}

        {/* For AI message streaming output */}
        {streamContent && (
          <AIMessage key={history.length} time={""} content={streamContent} />
        )}
      </Stack>
    </ScrollArea>
  );
}
