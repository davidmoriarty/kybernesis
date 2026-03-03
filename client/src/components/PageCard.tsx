// client/src/components/PageCard.tsx
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";

export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      <Container>
        <div className="bg-slate-200 dark:bg-slate-700 max-w-7xl mx-auto px-8 py-16 border rounded shadow">
          <div className="flex flex-col gap-4">{children}</div>
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
