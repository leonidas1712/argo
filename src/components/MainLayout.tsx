import {
  Container,
  Stack,
  AppShell,
  Burger,
  Group,
  Text,
  Box,
  useMantineColorScheme,
} from "@mantine/core";
import { ReactNode } from "react";
import { useDisclosure } from "@mantine/hooks";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();

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
          </Group>
        </Group>
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
        <Container size="md" py="xl" h="100%" style={{ overflow: "hidden" }}>
          <Stack h="100%" justify="space-between">
            {children}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
