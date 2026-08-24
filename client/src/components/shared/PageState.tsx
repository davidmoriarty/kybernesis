// client/src/components/shared/PageState.tsx

import { Container, Section } from "@/components/app";

export function PageState({ children }: { children: React.ReactNode }) {
  return (
    <Section>
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

export function EmptyState({
  message = "Nothing here yet.",
}: {
  message?: string;
}) {
  return (
    <p className="py-6 text-center text-lg text-muted-foreground">{message}</p>
  );
}
