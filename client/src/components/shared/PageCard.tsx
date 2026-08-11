// client/src/components/shared/PageCard.tsx

import { Container, Section } from "@/components/app";

export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <Section className="flex min-h-[calc(100svh-var(--navbar-height))] flex-col items-center justify-center">
      <Container>{children}</Container>
    </Section>
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <p className="text-center text-lg py-6">
      <span className="animate-spin inline-block mr-2">⏳</span>
      {message}
    </p>
  );
}

export function ErrorState({
  message = "Something went wrong.",
}: {
  message?: string;
}) {
  return <p className="text-center text-lg text-destructive py-6">{message}</p>;
}
