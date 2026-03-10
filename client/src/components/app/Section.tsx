// client/src/components/app/Section.tsx

export function Section({
  children,
  padding = "py-8",
  className = "",
}: {
  children: React.ReactNode;
  padding?: string;
  className?: string; // for bg color, padding, etc.
}) {
  return (
    <section className={`w-full ${padding} ${className}`}>{children}</section>
  );
}
