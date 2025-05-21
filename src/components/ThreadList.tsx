import { Stack, Button } from "@mantine/core";
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
  return (
    <Stack gap="xs">
      {threads.length > 0 &&
        threads.map((thread) => (
          <Button
            key={thread.id}
            variant={currentThreadId === thread.id ? "filled" : "subtle"}
            onClick={() => setCurrentThreadId(thread.id)}
            fullWidth
            justify="flex-start"
          >
            {thread.name}
          </Button>
        ))}
    </Stack>
  );
}

export default ThreadList;
