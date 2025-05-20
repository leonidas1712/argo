import { createContext, useContext, useState, ReactNode } from "react";

interface ThreadContextType {
  currentThreadId: string | null;
  setCurrentThreadId: (id: string | null) => void;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  return (
    <ThreadContext.Provider value={{ currentThreadId, setCurrentThreadId }}>
      {children}
    </ThreadContext.Provider>
  );
}

export function useCurrentThread() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useCurrentThread must be used within a ThreadProvider");
  }
  return context;
}
