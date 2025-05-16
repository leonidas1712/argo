import { useState } from "react";
import { Flex, Stack } from "@mantine/core";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ColorSchemeToggle from "./ColorSchemeToggle";
import { ArgoChatMessage } from "../types/commands";

// Main component for one chat session
function Chat() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ArgoChatMessage[]>([]);
  const [streamContent, setStreamContent] = useState("");

  return (
    <>
      <Flex justify="flex-end">
        <ColorSchemeToggle />
      </Flex>

      <MessageList history={history} streamContent={streamContent} />

      <Stack gap="md" align="center">
        <ChatInput
          loading={loading}
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
