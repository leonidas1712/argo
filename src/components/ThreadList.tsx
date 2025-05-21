import { Stack, Box, Text } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { Thread } from "../service/types";

interface ThreadListProps {
  threads: Thread[];
  currentThreadId: string | null;
  setCurrentThreadId: (id: string) => void;
}

function ThreadList({
  threads,
  currentThreadId,
  setCurrentThreadId,
}: ThreadListProps) {
  const { colorScheme } = useMantineColorScheme();
  const padding = 8;
  return (
    <Stack gap="xs">
      {threads.map((thread) => {
        const isSelected = thread.id === currentThreadId;
        return (
          <Box
            key={thread.id}
            p={padding}
            style={{
              borderRadius: 12,
              background: isSelected
                ? colorScheme === "dark"
                  ? "#333"
                  : "#f1f3f5"
                : "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onClick={() => setCurrentThreadId(thread.id)}
          >
            <Text size="sm" fw={500} truncate="end">
              {thread.name}
            </Text>
          </Box>
        );
      })}
    </Stack>
  );
}

export default ThreadList;
