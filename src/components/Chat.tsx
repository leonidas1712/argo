import { useEffect, useState } from "react";
import { Flex, Stack } from "@mantine/core";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ColorSchemeToggle from "./ColorSchemeToggle";
import { ArgoChatMessage } from "../types/commands";
import { useInitialChat } from "../hooks/useChat";
import { showErrorNotification } from "../types/errors";

// Main component for one chat session
function Chat() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ArgoChatMessage[]>([]);
  const [streamContent, setStreamContent] = useState("");

  // Get initial messages
  const {
    data: initialMessages,
    isLoading: initialChatStateLoading,
    error,
  } = useInitialChat();

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
      <Flex justify="flex-end">
        <ColorSchemeToggle />
      </Flex>

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
