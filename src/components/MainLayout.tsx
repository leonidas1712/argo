import {
  Container,
  Stack,
  AppShell,
  useMantineColorScheme,
  ScrollArea,
} from "@mantine/core";
import { ReactNode } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import AppHeader from "./AppHeader";
import { useCurrentThread } from "../contexts/ThreadContext";
import { Thread } from "../service/types";
import ThreadList from "./ThreadList";

interface MainLayoutProps {
  children: ReactNode;
  threads: Thread[];
}

export default function MainLayout({ children, threads }: MainLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();
  const isDesktop = useMediaQuery("(min-width: 48em)"); // Mantine's 'sm' breakpoint
  const { currentThreadId, setCurrentThreadId } = useCurrentThread();

  const sidebarIconColor =
    colorScheme === "dark" ? "rgba(170, 170, 170, 1)" : "black";

  const sidebarOpened = isDesktop ? desktopOpened : mobileOpened;
  const toggleSidebar = isDesktop ? toggleDesktop : toggleMobile;

  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{
        width: 180,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding={0}
    >
      <AppShell.Header>
        <AppHeader
          sidebarOpened={sidebarOpened}
          toggleSidebar={toggleSidebar}
          sidebarIconColor={sidebarIconColor}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <ScrollArea style={{ maxHeight: "80vh" }} scrollbarSize={6}>
            <ThreadList
              threads={threads}
              currentThreadId={currentThreadId}
              setCurrentThreadId={setCurrentThreadId}
            />
          </ScrollArea>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main h="100dvh" style={{ overflow: "hidden" }}>
        <Container size="lg" py="xl" h="100%" style={{ overflow: "hidden" }}>
          <Stack h="100%" justify="space-between">
            {children}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
