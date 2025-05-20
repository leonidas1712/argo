import {
  Group,
  Stack,
  Textarea,
  Paper,
  ActionIcon,
  Tooltip,
  Select,
  Loader,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { ArgoChatMessage, ChatMessage } from "../service/types";
import { useModels } from "../hooks/useModels";
import { useChatMutation } from "../hooks/useChatMutation";
import { useCurrentThread } from "../contexts/ThreadContext";

interface ChatInputProps {
  // to disable sending while a response is loading
  loading: boolean;
  // set loading state outside: so we can use it when non-streaming
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // chat history so far without latest message from input
  history: ArgoChatMessage[];
  // use this to set chat history with new messages (user input, AI responses)
  setHistory: React.Dispatch<React.SetStateAction<ArgoChatMessage[]>>;
  // to set content from streaming response
  setStreamContent: React.Dispatch<React.SetStateAction<string>>;
}

function ChatInput(props: ChatInputProps) {
  const { loading, setLoading, history, setHistory, setStreamContent } = props;
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { currentThreadId, setCurrentThreadId } = useCurrentThread();

  const { data: modelOptions } = useModels();
  const [selectedModel, setSelectedModel] = useState("");

  const chatMutation = useChatMutation();

  useEffect(() => {
    if (modelOptions && modelOptions.length > 0) {
      setSelectedModel(modelOptions[0]);
    }
  }, [modelOptions]);

  async function sendInput() {
    if (loading || !input.trim() || !modelOptions?.length) {
      return;
    }

    // Construct message from user including timestamp
    const timestamp = new Date().toISOString();
    const chat_msg: ChatMessage = {
      role: "user",
      content: input,
    };

    const last_message: ArgoChatMessage = {
      message: chat_msg,
      timestamp,
    };

    // Optimistically add user message
    setHistory((prev) => [...prev, last_message]);
    setInput("");
    setLoading(true);

    try {
      // mutateAsync lets us await the promise and catch error sequentially
      await chatMutation.mutateAsync({
        params: {
          // if thread id null, creates a new thread.
          thread_id: currentThreadId,
          model: selectedModel,
          history,
          last_message,
        },
        // receive chunk: set stream content to include it
        onChunk: (content) => {
          setStreamContent((prev) => prev + content);
        },
        // done: add AI response to history and clear streaming content
        onDone: (responseMsg) => {
          setHistory((prev) => [...prev, responseMsg]);
          setStreamContent("");
        },
        onSuccess: (newThreadId: string) => {
          console.log("Setting new thread id:", newThreadId);
          setCurrentThreadId(newThreadId);
        },
      });
    } catch (error) {
      // Remove optimistically added message on error
      setTimeout(() => {
        setHistory((prev) => prev.filter((msg) => msg.timestamp !== timestamp));
      }, 150);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendInput();
    }
  };

  return (
    <form
      style={{ width: "100%" }}
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
          style={{
            padding: 0,
            overflow: "hidden",
            borderColor: isFocused ? "#228be6" : undefined,
            borderWidth: 1,
          }}
        >
          <Textarea
            variant="unstyled"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            minRows={2}
            maxRows={5}
            autosize
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            styles={{
              input: { padding: 12, fontSize: "0.9rem" },
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Bottom row with model picker and send button */}
          <Group px="sm" pb="sm" justify="space-between" w="100%">
            <Select
              data={modelOptions}
              value={selectedModel}
              onChange={(value) => setSelectedModel(value || "")}
              variant="default"
              size="sm"
              radius="md"
              styles={{
                input: {
                  fontWeight: 500,
                  // make it more compact
                  paddingRight: 0,
                  minHeight: "unset",
                  height: "1.5rem",
                },
                wrapper: {
                  width: "100%",
                },
              }}
              comboboxProps={{
                transitionProps: { transition: "pop", duration: 100 },
              }}
            />

            {loading ? (
              <Loader size="sm" />
            ) : (
              <Tooltip label="Submit (or press Enter)" position="bottom">
                <ActionIcon
                  type="submit"
                  variant="filled"
                  size="md"
                  radius="sm"
                  color="blue"
                  disabled={loading || !input.trim() || !modelOptions?.length} // Disable if input is empty
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Paper>
      </Stack>
    </form>
  );
}

export default ChatInput;
