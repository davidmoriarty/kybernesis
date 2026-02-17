// client/src/components/PageCard.tsx
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";

export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <Section className="flex-1 flex flex-col overflow-y-auto py-6">
      <Container className="flex flex-col w-full max-w-3xl gap-6">
        <div className="border rounded-lg p-6 bg-background shadow-sm">
          {children}
        </div>
      </Container>
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
