// Container.tsx
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-5xl mx-auto px-8 ${className}`}>{children}</div>
  );
}
