// client/src/components/app/nav/tenantNav.ts

import {
  Brain,
  CircleUser,
  Folder,
  LogIn,
  LogOut,
  Building,
} from "lucide-react";
import type { NavConfig } from "./types";

export const tenantNav: NavConfig = {
  surface: "tenant",

  brand: {
    label: "Kybernesis",
    icon: Brain,
    authenticatedTo: "/projects",
    unauthenticatedTo: "/login",
  },

  authenticatedLinks: [
    {
      to: "/projects",
      label: "Projects",
      icon: Folder,
      ariaLabel: "Projects",
    },
    {
      to: "/workspaces",
      label: "Workspaces",
      icon: Building,
      ariaLabel: "Workspaces",
    },
  ],

  unauthenticatedLinks: [],

  authenticatedAccountLinks: [
    {
      to: "/me",
      label: "Me",
      icon: CircleUser,
      ariaLabel: "My account",
    },
    {
      to: "/logout",
      label: "Logout",
      icon: LogOut,
      ariaLabel: "Log out",
    },
  ],

  unauthenticatedAccountLinks: [
    {
      to: "/login",
      label: "Login",
      icon: LogIn,
      ariaLabel: "Log in",
    },
  ],
};
