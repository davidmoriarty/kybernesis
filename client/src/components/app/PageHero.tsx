// client/src/components/app/PageHero.tsx
import { Section, Container } from "@/components/app";

export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Section padding="py-8">
      <Container>
        <div className="space-y-2">
          <h1 className="font-black text-4xl">{title}</h1>
          <p className="font-medium text-base">{subtitle}</p>
        </div>
      </Container>
    </Section>
  );
}
