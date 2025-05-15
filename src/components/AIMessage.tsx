import { IconRobot } from "@tabler/icons-react";
import BaseMessage from "./BaseMessage";
import ReactMarkdown from "react-markdown";

function AIMessage({ content, time }: { content: string; time: string }) {
  return (
    <BaseMessage time={time} icon={IconRobot} avatarColor="blue">
      <ReactMarkdown>{content}</ReactMarkdown>
    </BaseMessage>
  );
}

export default AIMessage;
