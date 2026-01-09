// Section.tsx
export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string; // for bg color, padding, etc.
}) {
  return <section className={`w-full py-12 ${className}`}>{children}</section>;
}
