import { useState } from "react";
import "@mantine/core/styles.css";
import "./styles/global.css";
import { Flex, Stack } from "@mantine/core";

import MainLayout from "./components/MainLayout";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import { ArgoChatMessage } from "./types/commands";
import ColorSchemeToggle from "./components/ColorSchemeToggle";

function App() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ArgoChatMessage[]>([]);
  const [streamContent, setStreamContent] = useState("");

  return (
    <MainLayout>
      {/* Top bar with dark mode toggle */}
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
    </MainLayout>
  );
}

export default App;
