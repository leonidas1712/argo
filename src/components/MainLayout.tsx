import {
  Container,
  Stack,
  AppShell,
  Group,
  Text,
  Box,
  useMantineColorScheme,
  ActionIcon,
} from "@mantine/core";
import { ReactNode } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarRightExpand,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();

  const sidebarIconColor =
    colorScheme === "dark" ? "rgba(170, 170, 170, 1)" : "black";

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
            {/* only visible on mobile */}
            <ActionIcon
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="lg"
              aria-label="Open sidebar"
              variant="transparent"
              color={sidebarIconColor}
            >
              {mobileOpened ? (
                <IconLayoutSidebarRightExpand size={20} />
              ) : (
                <IconLayoutSidebarLeftExpand size={20} />
              )}
            </ActionIcon>
            {/* only visible on > sm (desktop) */}
            <ActionIcon
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="lg"
              aria-label="Collapse sidebar"
              variant="transparent"
              color={sidebarIconColor}
            >
              {desktopOpened ? (
                <IconLayoutSidebarRightExpand size={20} />
              ) : (
                <IconLayoutSidebarLeftExpand size={20} />
              )}
            </ActionIcon>
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
        <Container size="lg" py="xl" h="100%" style={{ overflow: "hidden" }}>
          <Stack h="100%" justify="space-between">
            {children}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
