// client/src/components/workspaces/WorkspaceDashboardRow.tsx

interface WorkspaceDashboardRowProps {
  children: React.ReactNode;
  columns: number;
}

export function WorkspaceDashboardRow({
  children,
  columns,
}: WorkspaceDashboardRowProps) {
  return (
    <div
      className="grid items-center gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  );
}
