import { Group, Avatar, Paper, Text } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";

interface BaseMessageProps {
  children: React.ReactNode;
  time: string;
  icon: React.ComponentType<IconProps>;
  avatarColor: string;
}

// BaseMessage with common styles for AIMessage and UserMessage
function BaseMessage({
  children,
  time,
  icon: Icon,
  avatarColor,
}: BaseMessageProps) {
  return (
    <Group align="flex-end" mb="xs" w="100%" wrap="nowrap">
      <Avatar color={avatarColor} radius="xl" size="md">
        <Icon />
      </Avatar>
      <Paper
        radius="md"
        p="md"
        style={{
          flex: 1,
          maxWidth: "85%",
        }}
        withBorder
      >
        {/* <Text size="md">{children}</Text> */}
        {children}
        <Text size="xs" c="dimmed" mt={10}>
          {time}
        </Text>
      </Paper>
    </Group>
  );
}

export default BaseMessage;
