// client/src/components/projects/detail/ProjectDetailPanel.tsx

import type { ReactNode } from "react";
import { Container, Section } from "@/components/app";

interface ProjectDetailPanelProps {
  children: ReactNode;
  className?: string;
}

export function ProjectDetailPanel({
  children,
  className,
}: ProjectDetailPanelProps) {
  return (
    <Section className={className}>
      <Container className="max-w-5xl">{children}</Container>
    </Section>
  );
}
