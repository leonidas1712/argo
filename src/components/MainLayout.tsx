import {
  Container,
  Stack,
  AppShell,
  Group,
  Text,
  Box,
  useMantineColorScheme,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { ReactNode } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconLayoutSidebarRightExpand,
  IconLayoutSidebarLeftExpand,
  IconPencilPlus,
} from "@tabler/icons-react";
import ColorSchemeToggle from "./ColorSchemeToggle";

interface MainLayoutProps {
  children: ReactNode;
}

function AppHeader({
  sidebarOpened,
  toggleSidebar,
  sidebarIconColor,
}: {
  sidebarOpened: boolean;
  toggleSidebar: () => void;
  sidebarIconColor: string;
}) {
  const toolTipLabel = sidebarOpened
    ? "Hide chat threads"
    : "Show chat threads";
  return (
    <Group h="100%" px="xs" justify="space-between">
      <Group>
        <Tooltip label={toolTipLabel} position="bottom">
          <ActionIcon
            onClick={toggleSidebar}
            size="lg"
            aria-label={sidebarOpened ? "Collapse sidebar" : "Open sidebar"}
            variant="subtle"
            color={sidebarIconColor}
          >
            {sidebarOpened ? (
              <IconLayoutSidebarRightExpand
                size={20}
                color={sidebarIconColor}
              />
            ) : (
              <IconLayoutSidebarLeftExpand size={20} color={sidebarIconColor} />
            )}
          </ActionIcon>
        </Tooltip>
        <Tooltip label="New thread" position="bottom">
          <ActionIcon
            size="lg"
            aria-label="New thread"
            variant="subtle"
            color={sidebarIconColor}
          >
            <IconPencilPlus size={20} color={sidebarIconColor} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <ColorSchemeToggle color={sidebarIconColor} />
    </Group>
  );
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
