import { IconUser } from "@tabler/icons-react";
import BaseMessage from "./BaseMessage";

function UserMessage({ content, time }: { content: string; time: string }) {
  return (
    <BaseMessage time={time} icon={IconUser} avatarColor="yellow">
      {/* Use p tag instead of ReactMarkdown so line breaks can be maintained */}
      <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
    </BaseMessage>
  );
}

export default UserMessage;
