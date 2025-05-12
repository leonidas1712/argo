import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "@mantine/core/styles.css";

import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Loader,
  Center,
  Paper,
  Group,
  Avatar,
  Flex,
} from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";

import ColorSchemeToggle from "./components/ColorSchemeToggle";

// User message component
function UserMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <Group align="flex-end" mb="xs" w="100%" wrap="nowrap">
      <Avatar color="gray" radius="xl" size="md">
        <span role="img" aria-label="user">
          👤
        </span>
      </Avatar>
      <Paper
        radius="md"
        p="md"
        bg="gray.1"
        style={{ flex: 1, maxWidth: "80%", marginLeft: 12 }}
      >
        <Text size="sm">{children}</Text>
        <Text size="xs" c="dimmed" mt={4}>
          {time}
        </Text>
      </Paper>
    </Group>
  );
}

// Argo (AI) message component
function AIMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <Group align="flex-end" mb="xs" w="100%" wrap="nowrap">
      <Avatar color="yellow" radius="xl" size="md">
        <IconRobot />
      </Avatar>
      <Paper
        radius="md"
        p="md"
        bg="yellow.0"
        style={{ flex: 1, maxWidth: "80%", marginLeft: 12 }}
      >
        <Group gap={4} align="center">
          <Text fw={500} span>
            Argo
          </Text>
        </Group>
        <Text size="sm" mt={4}>
          {children}
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          {time}
        </Text>
      </Paper>
    </Group>
  );
}

function App() {
  const [result, setResult] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function greet() {
    setLoading(true);
    const res = await invoke<string>("chat_request", { name });
    setResult(res ?? "");
    setLoading(false);
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
      </Stack>
    </Container>
  );
}

export default App;
