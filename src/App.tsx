import "@mantine/core/styles.css";
import "./styles/global.css";
import MainLayout from "./components/MainLayout";
import Chat from "./components/Chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Chat />
      </MainLayout>
    </QueryClientProvider>
  );
}

export default App;
