import "@mantine/core/styles.css";
import "./styles/global.css";
import MainLayout from "./components/MainLayout";
import Chat from "./components/Chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThreadProvider } from "./contexts/ThreadContext";
import { useThreads } from "./hooks/useThreads";
import { useCurrentThread } from "./contexts/ThreadContext";

const queryClient = new QueryClient();

function AppContent() {
  const { data: threads } = useThreads();
  const { currentThreadId } = useCurrentThread();

  return (
    <MainLayout threads={threads || []}>
      <Chat threadId={currentThreadId} />
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThreadProvider>
        <AppContent />
      </ThreadProvider>
    </QueryClientProvider>
  );
}

export default App;
