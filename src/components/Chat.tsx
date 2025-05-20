import { useEffect, useState } from "react";
import { Stack } from "@mantine/core";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { ArgoChatMessage } from "../service/types";
import { useInitialChat } from "../hooks/useChat";
import { showErrorNotification } from "../service/errors";

interface ChatProps {
  threadId: string | null;
}

// Main component for one chat session
function Chat({ threadId }: ChatProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ArgoChatMessage[]>([]);
  const [streamContent, setStreamContent] = useState("");

  // Get initial messages
  const {
    data: initialMessages,
    isLoading: initialChatStateLoading,
    error,
  } = useInitialChat(threadId);

  useEffect(() => {
    console.log("Chat useEff, init msgs", initialMessages);
    if (initialMessages) {
      setHistory(initialMessages);
    }
  }, [initialMessages]);

  if (error) {
    showErrorNotification(error);
  }

  return (
    <>
      <MessageList history={history} streamContent={streamContent} />

      <Stack gap="md" align="center">
        <ChatInput
          loading={loading || initialChatStateLoading}
          setLoading={setLoading}
          history={history}
          setHistory={setHistory}
          setStreamContent={setStreamContent}
        />
      </Stack>
    </>
  );
}

export default Chat;
