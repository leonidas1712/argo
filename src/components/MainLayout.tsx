import {
  Container,
  Stack,
  AppShell,
  Burger,
  Group,
  Text,
  Box,
} from "@mantine/core";
import { ReactNode } from "react";
import { useDisclosure } from "@mantine/hooks";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label="Open sidebar"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
              aria-label="Collapse sidebar"
            />
            <Text fw={700} size="lg" c="white">
              Threads
            </Text>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" style={{ background: "#232323" }}>
        <Stack>
          <Box bg="#333" p="md" style={{ borderRadius: 12 }} mb="xs">
            <Text c="white" size="md">
              My Name Is Jef
            </Text>
          </Box>
          <Text c="white" size="md" pl="xs">
            New Thread
          </Text>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main h="100dvh" style={{ overflow: "hidden" }}>
        <Container size="md" py="xl" h="100%" style={{ overflow: "hidden" }}>
          <Stack h="100%" justify="space-between">
            {children}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
