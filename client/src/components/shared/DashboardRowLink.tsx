// client/src/components/shared/DashboardRowLink.tsx

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface DashboardRowLinkProps {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  children: ReactNode;
  columns: number;
  className?: string;
}

export function DashboardRowLink({
  to,
  params,
  search,
  children,
  columns,
}: DashboardRowLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      search={search}
      className="grid grid-cols-3 items-center gap-4 px-2 py-1 transition-colors hover:bg-muted/60 cursor-pointer"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </Link>
  );
}
