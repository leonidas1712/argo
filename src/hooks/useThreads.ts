import { useQuery } from '@tanstack/react-query';
import { getThreadList } from '../service/commands';
import { Thread } from '../service/types';

export function useThreads() {
  return useQuery<Thread[]>({
    queryKey: ['threads'],
    queryFn: getThreadList,
  });
} 