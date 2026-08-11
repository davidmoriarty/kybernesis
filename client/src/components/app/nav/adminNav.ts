// client/src/components/app/nav/adminNav.ts

import {
  Brain,
  CircleUser,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react";
import type { NavConfig } from "./types";

export const adminNav: NavConfig = {
  surface: "admin",

  brand: {
    label: "Kybernesis",
    icon: Brain,
    authenticatedTo: "/admin",
    unauthenticatedTo: "/login",
  },

  authenticatedLinks: [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      ariaLabel: "Admin dashboard",
    },
  ],

  unauthenticatedLinks: [
    {
      to: "/login",
      label: "Login",
      icon: LogIn,
      ariaLabel: "Log in",
    },
  ],

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

  unauthenticatedAccountLinks: [],
};
