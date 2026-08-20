// client/src/components/app/Section.tsx

export function Section({
  children,
  padding = "py-6 md:py-8 lg:py-10",
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
