// Container.tsx
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`container mx-auto px-8 ${className}`}>{children}</div>
  );
}
