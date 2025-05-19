import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

function ColorSchemeToggle({ color }: { color?: string }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const size = 18;

  return (
    <Tooltip label="Toggle color scheme" position="left">
      <ActionIcon
        variant="subtle"
        size="md"
        aria-label="Toggle color scheme"
        onClick={toggleColorScheme}
        color={color}
      >
        {colorScheme === "dark" ? (
          <IconMoon size={size} color={color} />
        ) : (
          <IconSun size={size} color={color} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

export default ColorSchemeToggle;
