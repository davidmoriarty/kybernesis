import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/components/Navbar.tsx
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Brain,
  Building,
  CircleUser,
  Cog,
  Folder,
  ListCheck,
  LogIn,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/auth";
import { useConditionalMe } from "@/hooks/useContidionalMe";
import { cn } from "@/lib/utils";
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useConditionalMe();
  const logout = useLogout();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Unified links array
  const links = [
    {
      to: "/",
      label: "Kybernesis",
      icon: Brain,
      ariaLabel: "Home",
    },
    {
      to: "/me",
      label: "Me",
      icon: CircleUser,
      protected: true,
      ariaLabel: "My account",
    },
    {
      to: "/projects",
      label: "Projects",
      icon: Folder,
      protected: true,
      ariaLabel: "Projects",
    },
    {
      to: "/workspaces",
      label: "Workspaces",
      icon: Building,
      protected: true,
      ariaLabel: "Workspaces",
    },
    {
      to: "/login",
      label: "Login",
      icon: LogIn,
      showWhen: "loggedOut",
      ariaLabel: "Login",
    },
    {
      to: "/logout",
      label: "Logout",
      icon: LogOut,
      showWhen: "loggedIn",
      ariaLabel: "Logout",
    },
    {
      to: "/signup",
      label: "Signup",
      icon: ListCheck,
      showWhen: "loggedOut",
      ariaLabel: "Sign up",
    },
  ];
  function filterLinks(labels) {
    return links
      .filter((link) => labels.includes(link.label))
      .filter((link) => {
        if (!link.showWhen) return true;
        if (link.showWhen === "loggedIn") return !!me?.user;
        if (link.showWhen !== "loggedOut") return !me?.user;
        return true;
      })
      .map((link) => ({
        ...link,
        active: location.pathname.startsWith(link.to),
      }));
  }
  const desktopNavLinks = me?.user
    ? filterLinks(["Kybernesis", "Projects", "Workspaces"])
    : filterLinks(["Kybernesis", "Signup"]);
  const accountNavLinks = me?.user
    ? filterLinks(["Me", "Logout"])
    : filterLinks(["Signup", "Login"]);
  const mobileNavLinks = me?.user
    ? filterLinks(["Me", "Projects", "Workspaces", "Logout"])
    : filterLinks(["Signup", "Login"]);
  const navItemClass =
    "flex items-center gap-2 px-4 py-2 font-medium rounded-md hover:bg-slate-300/80 cursor-pointer";
  return _jsx("header", {
    className: cn(
      "sticky top-0 z-40",
      "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 supports-backdrop-filter:backdrop-blur",
      "border-b border-gray-200 dark:border-gray-600",
    ),
    children: _jsxs("nav", {
      className: "py-3 px-6 flex items-center justify-between",
      children: [
        _jsxs(Button, {
          variant: "link",
          className: cn(
            "text-xl font-bold text-gray-900 dark:text-gray-200",
            "border-0 p-0 flex items-center gap-2",
          ),
          onClick: () => navigate({ to: desktopNavLinks[0]?.to }),
          "aria-label": desktopNavLinks[0]?.ariaLabel,
          children: [_jsx(Brain, { size: 24 }), desktopNavLinks[0]?.label],
        }),
        _jsxs("div", {
          className: "hidden sm:flex items-center gap-4",
          children: [
            desktopNavLinks
              .slice(1)
              .map(({ to, label, icon: Icon, ariaLabel, active }) =>
                _jsxs(
                  Button,
                  {
                    variant: active ? "link" : "outline",
                    className: `${navItemClass} ${active ? "bg-slate-300/80 font-bold" : ""}`,
                    "aria-label": ariaLabel,
                    onClick: () => navigate({ to }),
                    children: [
                      Icon && _jsx(Icon, { className: "w-4 h-4" }),
                      label,
                    ],
                  },
                  to,
                ),
              ),
            me?.user &&
              _jsxs(DropdownMenu, {
                open: accountOpen,
                onOpenChange: setAccountOpen,
                children: [
                  _jsx(DropdownMenuTrigger, {
                    asChild: true,
                    children: _jsxs(Button, {
                      variant: "ghost",
                      className: navItemClass,
                      "aria-label": "Account",
                      children: [_jsx(Cog, {}), "Account"],
                    }),
                  }),
                  _jsx(DropdownMenuContent, {
                    align: "end",
                    children: accountNavLinks.map(
                      ({ to, label, icon: Icon, ariaLabel, active }) =>
                        _jsxs(
                          DropdownMenuItem,
                          {
                            "aria-label": ariaLabel,
                            className: active
                              ? "bg-slate-300/80 font-bold"
                              : "",
                            onClick: () => {
                              setAccountOpen(false);
                              if (to === "/logout") {
                                logout.mutate();
                                return;
                              }
                              navigate({ to });
                            },
                            children: [
                              Icon && _jsx(Icon, { className: "w-4 h-4" }),
                              label,
                            ],
                          },
                          to,
                        ),
                    ),
                  }),
                ],
              }),
          ],
        }),
        _jsx("div", {
          className: "sm:hidden",
          children: _jsxs(DropdownMenu, {
            open: mobileOpen,
            onOpenChange: setMobileOpen,
            children: [
              _jsx(DropdownMenuTrigger, {
                asChild: true,
                children: _jsx(Button, {
                  variant: "ghost",
                  size: "icon-lg",
                  "aria-label": "Menu",
                  children: _jsx(Menu, {}),
                }),
              }),
              _jsx(DropdownMenuContent, {
                align: "end",
                children: mobileNavLinks.map(
                  ({ to, label, icon: Icon, ariaLabel, active }) =>
                    _jsxs(
                      DropdownMenuItem,
                      {
                        "aria-label": ariaLabel,
                        className: active ? "bg-slate-300/80 font-bold" : "",
                        onClick: () => {
                          setMobileOpen(false);
                          if (to === "/logout") {
                            logout.mutate();
                            return;
                          }
                          navigate({ to });
                        },
                        children: [
                          Icon && _jsx(Icon, { className: "w-4 h-4" }),
                          label,
                        ],
                      },
                      to,
                    ),
                ),
              }),
            ],
          }),
        }),
      ],
    }),
  });
}
