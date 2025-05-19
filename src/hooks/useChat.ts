import { useQuery } from "@tanstack/react-query";
import { ArgoChatMessage } from "../service/types";
import { getMessageHistory } from "../service/commands";

// Query for initial message history per thread. To load once only when loading a new thread.
export function useInitialChat(threadId: string) {
  return useQuery<ArgoChatMessage[]>({
    queryKey: ["messages", threadId],
    queryFn: () => getMessageHistory(threadId),
    staleTime: Infinity, // Never mark the data as stale - we only need to fetch once per thread on start
  });
}