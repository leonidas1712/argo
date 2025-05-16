import { Container, Stack } from "@mantine/core";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Container size="md" py="xl" h="100vh">
      <Stack h="100%" justify="space-between">
        {children}
      </Stack>
    </Container>
  );
}
