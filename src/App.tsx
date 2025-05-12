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
} from "@mantine/core";

// User message component
function UserMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <Group align="flex-end" justify="flex-end" mb="xs">
      <Paper radius="md" p="md" bg="gray.1" style={{ maxWidth: 350 }}>
        <Text size="sm">{children}</Text>
      </Paper>
      <Avatar color="gray" radius="xl" size="md">
        <span role="img" aria-label="user">
          👤
        </span>
      </Avatar>
      <Text size="xs" c="dimmed" ml={4} style={{ alignSelf: "flex-end" }}>
        {time}
      </Text>
    </Group>
  );
}

// Argo (AI) message component
function ArgoMessage({
  children,
  time,
  showWave,
}: {
  children: React.ReactNode;
  time: string;
  showWave?: boolean;
}) {
  return (
    <Group align="flex-end" mb="xs">
      <Avatar color="yellow" radius="xl" size="md">
        <span role="img" aria-label="Argo">
          🤚
        </span>
      </Avatar>
      <Paper radius="md" p="md" bg="yellow.0" style={{ maxWidth: 350 }}>
        <Group gap={4} align="center">
          {showWave && (
            <Text span size="lg">
              🤚
            </Text>
          )}
          <Text fw={500} span>
            Argo
          </Text>
          <Text size="xs" c="dimmed" span>
            {time}
          </Text>
        </Group>
        <Text size="sm" mt={4}>
          {children}
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
      <Stack w="100%" mx="auto" mb="md">
        <UserMessage time="10:19:07 PM">Hi!</UserMessage>
        <ArgoMessage time="10:19:07 PM" showWave>
          How can I help you today?
        </ArgoMessage>
        <UserMessage time="10:19:16 PM">
          What is the capital of France?
        </UserMessage>
        <ArgoMessage time="10:19:16 PM">
          The capital of France is Paris.
        </ArgoMessage>
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
