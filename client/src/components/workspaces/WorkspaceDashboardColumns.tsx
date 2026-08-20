// client/src/components/workspaces/WorkspaceDashboardColumns.tsx

import type { ReactNode } from "react";

interface WorkspaceDashboardColumnsProps {
  children: ReactNode;
}

export function WorkspaceDashboardColumns({
  children,
}: WorkspaceDashboardColumnsProps) {
  return (
    <div className="grid grid-cols-3 items-center gap-4 px-2 py-1">
      {children}
    </div>
  );
}
