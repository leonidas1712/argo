import {
  Button,
  Group,
  Stack,
  Textarea,
  Paper,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { invokeCommand } from "../types/commands";
import { showErrorNotification } from "../types/errors";

interface ChatInputProps {
  // to disable sending while a response is loading
  loading: boolean;
  // set loading state outside: so we can use it when non-streaming
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // set AI message result outside the input
  setResult: React.Dispatch<React.SetStateAction<string>>;
}

function ChatInput(props: ChatInputProps) {
  const { loading, setLoading, setResult } = props;

  const [input, setInput] = useState("");

  async function sendInput() {
    if (loading || !input.trim()) {
      return;
    }

    setLoading(true);

    try {
      const res = await invokeCommand("chat_request", { input });
      setResult(res.content);
    } catch (err: any) {
      showErrorNotification(err);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      sendInput();
    }
  };

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
            onKeyDown={handleKeyDown} // Add keyboard handler
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

            <Tooltip label="Submit (or press Enter)" position="bottom">
              <ActionIcon
                type="submit"
                variant="filled"
                size="md"
                radius="sm"
                color="blue"
                disabled={loading || !input.trim()} // Disable if input is empty
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
