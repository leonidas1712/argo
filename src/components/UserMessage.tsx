import { Group, Avatar, Paper, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

function UserMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <Group align="flex-end" mb="xs" w="100%" wrap="nowrap">
      <Avatar color="yellow" radius="xl" size="md">
        <IconUser />
      </Avatar>
      <Paper
        radius="md"
        p="md"
        style={{
          flex: 1,
          maxWidth: "85%",
          // marginLeft: "2%",
          whiteSpace: "pre-wrap",
        }}
        withBorder
      >
        <Text size="md">{children}</Text>
        <Text size="xs" c="dimmed" mt={10}>
          {time}
        </Text>
      </Paper>
    </Group>
  );
}

export default UserMessage;
