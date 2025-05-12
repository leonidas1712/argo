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
} from "@mantine/core";

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
      <Stack gap="md" align="center">
        <Title order={1}>Welcome to Argo</Title>
        <Text>Enter your name below!</Text>

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
