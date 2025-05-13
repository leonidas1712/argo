import { useState } from "react";
import "@mantine/core/styles.css";
import { notifications } from "@mantine/notifications";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Loader,
  Center,
  Flex,
} from "@mantine/core";

import ColorSchemeToggle from "./components/ColorSchemeToggle";
import UserMessage from "./components/UserMessage";
import AIMessage from "./components/AIMessage";
import ChatInput from "./components/ChatInput";

function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Container size="sm" py="xl">
      {/* Top bar with dark mode toggle */}
      <Flex justify="flex-end" mb="md">
        <ColorSchemeToggle />
      </Flex>

      <Stack w="100%" mx="auto" mb="md">
        <UserMessage time="10:19:07 PM">Hi!</UserMessage>
        <AIMessage time="10:19:07 PM">How can I help you today?</AIMessage>
        <UserMessage time="10:19:16 PM">
          What is the capital of France?
        </UserMessage>
        <AIMessage time="10:19:16 PM">
          The capital of France is Paris.
        </AIMessage>
        <AIMessage time="10:20:01 PM">
          The message boxes for both user and AI messages will now stretch to
          take up the full available width (up to a max of 600px for
          readability), with the avatar on the left and the message box filling
          the rest of the row. This should give you a more modern, full-width
          chat look as requested! Let me know if you want to adjust the max
          width or any other details.
        </AIMessage>
      </Stack>

      <Stack gap="md" align="center">
        <ChatInput
          loading={loading}
          setLoading={setLoading}
          setResult={setResult}
        />

        {loading ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : (
          <Text>Result: {result.length > 0 ? result : "Empty result."}</Text>
        )}
      </Stack>
    </Container>
  );
}

export default App;
