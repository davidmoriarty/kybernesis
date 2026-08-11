// client/src/components/app/nav/publicNav.ts

import { Brain } from "lucide-react";
import type { NavConfig } from "./types";

export const publicNav: NavConfig = {
  surface: "public",

  brand: {
    label: "Kybernesis",
    icon: Brain,
    authenticatedTo: "/",
    unauthenticatedTo: "/",
  },

  authenticatedLinks: [],
  unauthenticatedLinks: [],
  authenticatedAccountLinks: [],
  unauthenticatedAccountLinks: [],
};
