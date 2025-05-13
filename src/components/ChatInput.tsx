import {
  Button,
  Group,
  Stack,
  Textarea,
  Paper,
  Flex,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { notifications } from "@mantine/notifications";
import { IconSend } from "@tabler/icons-react";

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
        <Paper
          withBorder
          radius="md"
          w="100%"
          style={{ padding: 0, overflow: "hidden" }}
        >
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

          {/* Bottom row with model picker and send button */}
          <Group px="sm" pb="sm" justify="space-between" w="100%">
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

            <Tooltip label="Submit" position="bottom">
              <ActionIcon
                type="submit"
                variant="filled"
                size="md"
                radius="sm"
                color="blue"
              >
                <IconSend size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>
      </Stack>
    </form>
  );
}

export default ChatInput;
