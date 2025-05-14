import { IconUser } from "@tabler/icons-react";
import BaseMessage from "./BaseMessage";

function UserMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <BaseMessage time={time} icon={IconUser} avatarColor="yellow">
      {children}
    </BaseMessage>
  );
}

export default UserMessage;
