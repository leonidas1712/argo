import { useQuery } from "@tanstack/react-query";
import { ArgoChatMessage, getMessageHistory } from "../types/commands";

// For now we'll hardcode the thread ID since it's hardcoded in the backend
const TEST_THREAD_ID = "test";

// Query for initial message history per thread. To load once only when loading a new thread.
export function useInitialChat() {
  return useQuery<ArgoChatMessage[]>({
    queryKey: ["messages", TEST_THREAD_ID],
    queryFn: () => getMessageHistory(TEST_THREAD_ID),
    staleTime: Infinity, // Never mark the data as stale - we only need to fetch once per thread on start
  });
}