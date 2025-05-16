import {
  Group,
  Stack,
  Textarea,
  Paper,
  ActionIcon,
  Tooltip,
  Select,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconSend } from "@tabler/icons-react";
import {
  ArgoChatMessage,
  ChatMessage,
  ChatRequestParams,
  ChatStreamEvent,
  listModels,
  sendChatRequestStream,
} from "../types/commands";
import { showErrorNotification } from "../types/errors";
import { Channel } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import { useModels } from "../hooks/useModels";

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

  const { data: modelOptions } = useModels();

  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    // console.log("USE EFF TO SET MODEL");
    if (modelOptions && modelOptions.length > 0) {
      setSelectedModel(modelOptions[0]);
    }
  }, [modelOptions]);

  async function sendInput() {
    if (loading || !input.trim() || !modelOptions?.length) {
      return;
    }

    setLoading(true);
    console.log("history:", history);

    // Generate timestamp once to use for both optimistic update and error handling
    const timestamp = new Date().toISOString();

    try {
      const chat_msg: ChatMessage = {
        role: "user",
        content: input,
      };

      const last_message: ArgoChatMessage = {
        message: chat_msg,
        timestamp,
      };

      const req: ChatRequestParams = {
        model: selectedModel,
        history,
        last_message,
      };

      // Optimistically add user's last message
      setHistory((prevHistory) => [...prevHistory, last_message]);
      setInput("");

      // Try streaming
      console.log("STREAMING REQ");
      const onEvent = new Channel<ChatStreamEvent>();
      const buffer: string[] = [];

      onEvent.onmessage = (message) => {
        console.log(`Got chat event: ${JSON.stringify(message)}`);

        switch (message.event) {
          case "chunk":
            buffer.push(message.content);
            setStreamContent((prev) => prev + message.content);
            break;
          case "done":
            const responseChatMsg: ChatMessage = {
              role: "assistant",
              content: buffer.join(""),
            };

            const responseArgoMsg: ArgoChatMessage = {
              message: responseChatMsg,
              timestamp: new Date().toISOString(),
            };

            console.log("Buffer:", buffer);
            console.log("Content:", responseArgoMsg.message.content);

            setHistory((prevHistory) => [...prevHistory, responseArgoMsg]);
            // reset streaming msg
            setStreamContent("");
        }
      };

      const res = await sendChatRequestStream(req, onEvent);
      console.log("chat_request_stream invoke RESPONSE:", res);
    } catch (err: any) {
      // Remove the optimistically added message using its timestamp
      // Delay slightly so its less abrupt
      setTimeout(() => {
        setHistory((prevHistory) =>
          prevHistory.filter((msg) => msg.timestamp !== timestamp)
        );
      }, 150);
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
            placeholder="Ask me anything"
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
          </Group>
        </Paper>
      </Stack>
    </form>
  );
}

export default ChatInput;
