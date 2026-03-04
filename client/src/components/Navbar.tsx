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

  interface NavLink {
    to: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    protected?: boolean;
    showWhen?: "loggedIn" | "loggedOut";
    ariaLabel?: string;
    active?: boolean;
  }

  // Unified links array
  const links: NavLink[] = [
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

  function filterLinks(labels: string[]): NavLink[] {
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

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "supports-backdrop-filter:backdrop-blur",
        "border-b border-gray-300 dark:border-gray-500",
      )}
    >
      <nav className="container mx-auto py-3 flex items-center justify-between">
        {/* Brand / App name */}
        <Button
          variant="link"
          className={cn(
            "text-xl font-bold text-gray-900 dark:text-gray-200",
            "border-0 p-0 flex items-center gap-2",
          )}
          onClick={() => navigate({ to: desktopNavLinks[0]?.to })}
          aria-label={desktopNavLinks[0]?.ariaLabel}
        >
          <Brain size={24} />
          {desktopNavLinks[0]?.label}
        </Button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-4">
          {desktopNavLinks
            .slice(1)
            .map(({ to, label, icon: Icon, ariaLabel, active }) => (
              <Button
                key={to}
                variant={active ? "link" : "outline"}
                className={`${navItemClass} ${
                  active ? "bg-slate-300/80 font-bold" : ""
                }`}
                aria-label={ariaLabel}
                onClick={() => navigate({ to })}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </Button>
            ))}

          {/* Account dropdown */}
          {me?.user && (
            <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={navItemClass}
                  aria-label="Account"
                >
                  <Cog />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {accountNavLinks.map(
                  ({ to, label, icon: Icon, ariaLabel, active }) => (
                    <DropdownMenuItem
                      key={to}
                      aria-label={ariaLabel}
                      className={active ? "bg-slate-300/80 font-bold" : ""}
                      onClick={() => {
                        setAccountOpen(false);

                        if (to === "/logout") {
                          logout.mutate();
                          return;
                        }

                        navigate({ to });
                      }}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden">
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg" aria-label="Menu">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {mobileNavLinks.map(
                ({ to, label, icon: Icon, ariaLabel, active }) => (
                  <DropdownMenuItem
                    key={to}
                    aria-label={ariaLabel}
                    className={active ? "bg-slate-300/80 font-bold" : ""}
                    onClick={() => {
                      setMobileOpen(false);

                      if (to === "/logout") {
                        logout.mutate();
                        return;
                      }

                      navigate({ to });
                    }}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
