import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const size = 18;

  return (
    <Tooltip label="Toggle color scheme" position="left">
      <ActionIcon
        variant="subtle"
        size="md"
        aria-label="Toggle color scheme"
        onClick={toggleColorScheme}
      >
        {colorScheme === "dark" ? (
          <IconMoon size={size} />
        ) : (
          <IconSun size={size} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

export default ColorSchemeToggle;
