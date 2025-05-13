import { useState, useEffect, useRef } from "react";
import "@mantine/core/styles.css";

import { Container, Stack, Flex, ScrollArea } from "@mantine/core";

import ColorSchemeToggle from "./components/ColorSchemeToggle";
import UserMessage from "./components/UserMessage";
import AIMessage from "./components/AIMessage";
import ChatInput from "./components/ChatInput";
import { ChatMessage } from "./types/commands";

function App() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const viewport = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when history changes
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  return (
    <Container size="sm" py="xl" h="100vh">
      {/* <Flex justify="flex-end">
        <ColorSchemeToggle />
      </Flex> */}
      <Stack h="100%" justify="space-between">
        {/* Top bar with dark mode toggle */}
        <Flex justify="flex-end">
          <ColorSchemeToggle />
        </Flex>

        {/* Scrollable message area */}
        <ScrollArea mb="sm" viewportRef={viewport}>
          <Stack>
            {history.map((msg, index) => {
              if (msg.role === "user") {
                return (
                  <UserMessage key={index} time="user time">
                    {msg.content}
                  </UserMessage>
                );
              }
              return (
                <AIMessage key={index} time="AI time">
                  {msg.content}
                </AIMessage>
              );
            })}
          </Stack>
        </ScrollArea>

        {/* Chat input fixed at bottom */}
        <Stack gap="md" align="center">
          <ChatInput
            loading={loading}
            setLoading={setLoading}
            history={history}
            setHistory={setHistory}
          />
        </Stack>
      </Stack>
    </Container>
  );
}

export default App;
