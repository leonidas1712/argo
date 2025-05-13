import { Button, Group, Stack, Textarea, Paper } from "@mantine/core";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { notifications } from "@mantine/notifications";

interface ChatInputProps {
  // set loading state outside: so we can use it when non-streaming
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // set AI message result outside the input
  setResult: React.Dispatch<React.SetStateAction<string>>;
}

function ChatInput(props: ChatInputProps) {
  const { setLoading, setResult } = props;

  const [input, setInput] = useState("");

  async function sendInput() {
    setLoading(true);

    try {
      const res = await invoke<string>("chat_request", { input });
      setResult(res ?? "");
    } catch (error: any) {
      const string = JSON.stringify(error, null, 2);

      notifications.show({
        title: "Error!",
        message: string ?? "There was an error. Please try again.",
        color: "red",
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <form
      style={{ width: "80%" }}
      onSubmit={(e) => {
        e.preventDefault();
        sendInput();
      }}
    >
      <Stack gap="sm">
        {/* chat box with shared border from Paper */}
        <Paper
          withBorder
          radius="md"
          w="100%"
          style={{ padding: 0, overflow: "hidden" }}
        >
          {/* text area without its own border (unstyled variant */}
          <Textarea
            variant="unstyled"
            placeholder="Ask me anything"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            minRows={2}
            maxRows={5}
            autosize
            styles={{
              input: { padding: 12, fontSize: "0.9rem" },
            }}
          />

          {/* row for model-picker button - group for spacing */}
          <Group px="sm" pb="sm">
            <Button
              variant="default"
              size="xs"
              radius="md"
              style={{
                fontWeight: 500,
                fontFamily: "monospace",
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              llama3.2:3b
            </Button>
          </Group>
        </Paper>

        <Button type="submit">Send</Button>
      </Stack>
    </form>
  );
}

export default ChatInput;
