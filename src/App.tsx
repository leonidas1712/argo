import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "@mantine/core/styles.css";
import { notifications } from "@mantine/notifications";

import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Loader,
  Center,
  Flex,
} from "@mantine/core";

import ColorSchemeToggle from "./components/ColorSchemeToggle";
import UserMessage from "./components/UserMessage";
import AIMessage from "./components/AIMessage";

function App() {
  const [result, setResult] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function greet() {
    setLoading(true);

    try {
      const res = await invoke<string>("chat_request", { name });
      setResult(res ?? "");
    } catch (error: any) {
      const string = JSON.stringify(error, null, 2);

      notifications.show({
        title: "Error!",
        message: string ?? "There was an error. Please try again.",
        color: "red",
        autoClose: 2000,
      });
      setResult("");
    } finally {
      setLoading(false);
    }
  }

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
        <Title order={1}>Welcome to Argo</Title>
        <Text>Enter your name below!</Text>
        {/* Chat UI mockup */}

        <form
          style={{ width: "80%" }}
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <Stack gap="sm">
            <TextInput
              placeholder="Enter a name..."
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              size="sm"
            />
            <Button type="submit">Greet</Button>
          </Stack>
        </form>

        {loading ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : (
          <Text>Result: {result.length > 0 ? result : "Empty result."}</Text>
        )}

        <Button
          onClick={() =>
            notifications.show({
              title: "Default notification",
              message: "Do not forget to star Mantine on GitHub! 🌟",
              color: "red",
              autoClose: 2000,
            })
          }
        >
          Show notification
        </Button>
      </Stack>
    </Container>
  );
}

export default App;
