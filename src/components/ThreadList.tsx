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
    <Stack>
      {threads.map((thread) =>
        thread.id === currentThreadId ? (
          <Box
            key={thread.id}
            p={padding}
            style={{
              borderRadius: 10,
              background: colorScheme === "dark" ? "#333" : "#f1f3f5",
              cursor: "pointer",
            }}
            onClick={() => setCurrentThreadId(thread.id)}
          >
            <Text size="sm">{thread.name}</Text>
          </Box>
        ) : (
          <Text
            key={thread.id}
            size="sm"
            pl={padding}
            style={{ cursor: "pointer" }}
            onClick={() => setCurrentThreadId(thread.id)}
          >
            {thread.name}
          </Text>
        )
      )}
    </Stack>
  );
}

export default ThreadList;
