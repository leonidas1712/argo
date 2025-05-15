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
import {
  ArgoChatMessage,
  ChatMessage,
  ChatRequestParams,
  ChatStreamEvent,
  sendChatRequestStream,
} from "../types/commands";
import { showErrorNotification } from "../types/errors";
import { Channel } from "@tauri-apps/api/core";

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

  async function sendInput() {
    if (loading || !input.trim()) {
      return;
    }

    setLoading(true);
    console.log("history:", history);

    try {
      const chat_msg: ChatMessage = {
        role: "user",
        content: input,
      };

      const last_message: ArgoChatMessage = {
        message: chat_msg,
        timestamp: new Date().toISOString(),
      };

      const req: ChatRequestParams = {
        model: "llama3.2:3b",
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

      // const res = await invokeCommand("chat_request_stream", req, { onEvent });
      const res = await sendChatRequestStream(req, onEvent);
      console.log("chat_request_stream invoke RESPONSE:", res);

      // invokeCommand("chat_request_stream", req, { onEvent })
      //   .then((res) => console.log("RESPONSE STREAMING:", res))
      //   .catch((err) => console.log("ERR STREAMING:", err));

      // Add AI response back to history
      // setHistory((prevHistory) => [...prevHistory, responseMsg]);
    } catch (err: any) {
      showErrorNotification(err);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  // async function sendInput() {
  //   if (loading || !input.trim()) {
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const chat_msg: ChatMessage = {
  //       role: "user",
  //       content: input,
  //     };

  //     const last_message: ArgoChatMessage = {
  //       message: chat_msg,
  //       timestamp: new Date().toISOString(),
  //     };

  //     const req = {
  //       model: "llama3.2:3b",
  //       history,
  //       last_message,
  //     };

  //     //   console.log("REQUEST:", req);

  //     // Optimistically add user's last message
  //     setHistory((prevHistory) => [...prevHistory, last_message]);
  //     setInput("");

  //     // Get response from LLM
  //     const responseMsg = await invokeCommand("chat_request", req);

  //     // Try streaming
  //     console.log("STREAMING REQ");
  //     const onEvent = new Channel<ChatStreamEvent>();
  //     onEvent.onmessage = (message) => {
  //       console.log(`Got chat event: ${JSON.stringify(message)}`);
  //     };

  //     invokeCommand("chat_request_stream", req, { onEvent })
  //       .then((res) => console.log("RESPONSE STREAMING:", res))
  //       .catch((err) => console.log("ERR STREAMING:", err));

  //     // Add AI response back to history
  //     setHistory((prevHistory) => [...prevHistory, responseMsg]);
  //   } catch (err: any) {
  //     showErrorNotification(err);
  //   } finally {
  //     setLoading(false);
  //     setInput("");
  //   }
  // }

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
