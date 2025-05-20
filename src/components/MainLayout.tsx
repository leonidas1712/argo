import {
  Container,
  Stack,
  AppShell,
  Text,
  Box,
  useMantineColorScheme,
} from "@mantine/core";
import { ReactNode } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import AppHeader from "./AppHeader";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();
  const isDesktop = useMediaQuery("(min-width: 48em)"); // Mantine's 'sm' breakpoint

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
          <Box
            p="xs"
            style={{
              borderRadius: 10,
              background: colorScheme === "dark" ? "#333" : "#f1f3f5",
            }}
          >
            <Text size="sm">My Name Is Jef</Text>
          </Box>

          <Text size="sm" pl="xs">
            New Thread
          </Text>
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
