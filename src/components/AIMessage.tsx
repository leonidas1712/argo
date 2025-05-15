import { IconRobot } from "@tabler/icons-react";
import BaseMessage from "./BaseMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AIMessage({ content, time }: { content: string; time: string }) {
  return (
    <BaseMessage time={time} icon={IconRobot} avatarColor="blue">
      {/* Gfm plugin gives tables, strikethroughs, etc */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </BaseMessage>
  );
}

export default AIMessage;
