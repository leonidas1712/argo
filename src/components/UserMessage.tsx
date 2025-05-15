import { IconUser } from "@tabler/icons-react";
import BaseMessage from "./BaseMessage";
import ReactMarkdown from "react-markdown";

function UserMessage({ content, time }: { content: string; time: string }) {
  return (
    <BaseMessage time={time} icon={IconUser} avatarColor="yellow">
      {/* <ReactMarkdown>{content}</ReactMarkdown> */}
      <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
    </BaseMessage>
  );
}

export default UserMessage;
