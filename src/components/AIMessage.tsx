import { Group, Avatar, Paper, Text } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";

// Argo (AI) message component
function AIMessage({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <Group align="flex-end" mb="xs" w="100%" wrap="nowrap">
      <Avatar color="blue" radius="xl" size="md">
        <IconRobot />
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
        <Group gap={4} align="center"></Group>
        <Text size="md" mt={4}>
          {children}
        </Text>
        <Text size="xs" c="dimmed" mt={10}>
          {time}
        </Text>
      </Paper>
    </Group>
  );
}

export default AIMessage;
