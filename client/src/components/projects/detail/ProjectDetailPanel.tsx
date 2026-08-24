// client/src/components/projects/detail/ProjectDetailPanel.tsx

import type { ReactNode } from "react";
import { Container, Section } from "@/components/app";

interface ProjectDetailPanelProps {
  children: ReactNode;
}

export function ProjectDetailPanel({ children }: ProjectDetailPanelProps) {
  return (
    <Section>
      <Container className="max-w-5xl">{children}</Container>
    </Section>
  );
}
