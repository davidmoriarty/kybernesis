// client/src/components/app/nav/types.ts

import type { LucideIcon } from "lucide-react";
import type { Surface } from "shared";

export type NavItem = {
  to: string;
  label: string;
  icon?: LucideIcon;
  ariaLabel?: string;
};

export type NavBrand = {
  label: string;
  icon?: LucideIcon;
  authenticatedTo: string;
  unauthenticatedTo: string;
};

export type NavConfig = {
  surface: Surface;
  brand: NavBrand;
  authenticatedLinks: NavItem[];
  unauthenticatedLinks: NavItem[];
  authenticatedAccountLinks: NavItem[];
  unauthenticatedAccountLinks: NavItem[];
};
