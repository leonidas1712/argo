import { Group, Tooltip, ActionIcon } from "@mantine/core";
import {
  IconLayoutSidebarRightExpand,
  IconLayoutSidebarLeftExpand,
  IconPencilPlus,
} from "@tabler/icons-react";
import ColorSchemeToggle from "./ColorSchemeToggle";

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

export default AppHeader;
