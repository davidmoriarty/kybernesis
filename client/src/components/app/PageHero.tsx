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
    <Section padding="py-6 md:py-8">
      <Container>
        <div className="space-y-2">
          <h1 className="text-3xl font-black md:text-4xl">{title}</h1>

          {subtitle && <p className="text-base font-medium">{subtitle}</p>}
        </div>
      </Container>
    </Section>
  );
}
