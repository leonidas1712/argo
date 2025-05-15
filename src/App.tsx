import { useState, useEffect, useRef } from "react";
import "@mantine/core/styles.css";

import { Container, Stack, Flex, ScrollArea } from "@mantine/core";

import ColorSchemeToggle from "./components/ColorSchemeToggle";
import UserMessage from "./components/UserMessage";
import AIMessage from "./components/AIMessage";
import ChatInput from "./components/ChatInput";
import { ArgoChatMessage } from "./types/commands";

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short", // "May"
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // "10:42 PM" instead of 22:42
  }).format(date);
}

function App() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ArgoChatMessage[]>([]);
  const [streamContent, setStreamContent] = useState("");

  const viewport = useRef<HTMLDivElement>(null);
  console.log("history:", history);

  // Auto scroll to bottom when history changes
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [history, streamContent]);

  return (
    <Container size="md" py="xl" h="100vh">
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
              <AIMessage
                key={history.length}
                time={""}
                content={streamContent}
              />
            )}
          </Stack>
        </ScrollArea>

        {/* Chat input fixed at bottom */}
        <Stack gap="md" align="center">
          <ChatInput
            loading={loading}
            setLoading={setLoading}
            history={history}
            setHistory={setHistory}
            setStreamContent={setStreamContent}
          />
        </Stack>
      </Stack>
    </Container>
  );
}

export default App;
