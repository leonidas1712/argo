import { IconRobot } from "@tabler/icons-react";
import BaseMessage from "./BaseMessage";

function AIMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <BaseMessage time={time} icon={IconRobot} avatarColor="blue">
      {children}
    </BaseMessage>
  );
}

export default AIMessage;
