// client/src/components/app/Footer.tsx

import { Section } from "@/components/app/Section";
import { Container } from "@/components/app/Container";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border">
      <Section padding="py-4">
        <Container>&copy; 2026 Kybernesis. All rights reserved.</Container>
      </Section>
    </footer>
  );
}
