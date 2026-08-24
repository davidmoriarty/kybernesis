// client/src/components/app/Navbar.tsx

import { useLocation, useNavigate } from "@tanstack/react-router";
import { Cog, Menu } from "lucide-react";
import { useState } from "react";
import { adminNav } from "@/components/app/nav/adminNav";
import { publicNav } from "@/components/app/nav/publicNav";
import { tenantNav } from "@/components/app/nav/tenantNav";
import type { NavConfig, NavItem } from "@/components/app/nav/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/auth";
import { useConditionalMe } from "@/hooks/useContidionalMe";
import { getCurrentHostContext } from "@/lib/tenantHost";
import { cn } from "@/lib/utils";

const navConfigs = {
  public: publicNav,
  tenant: tenantNav,
  admin: adminNav,
} satisfies Record<string, NavConfig>;

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useConditionalMe();
  const logout = useLogout();

  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { surface } = getCurrentHostContext();
  const config = navConfigs[surface];
  const isAuthenticated = !!me?.user;

  const brandTo = isAuthenticated
    ? config.brand.authenticatedTo
    : config.brand.unauthenticatedTo;

  const primaryLinks = isAuthenticated
    ? config.authenticatedLinks
    : config.unauthenticatedLinks;

  const accountLinks = isAuthenticated
    ? config.authenticatedAccountLinks
    : config.unauthenticatedAccountLinks;

  const mobileLinks = [...primaryLinks, ...accountLinks];

  const BrandIcon = config.brand.icon;

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const handleNavItem = (item: NavItem) => {
    if (item.to === "/logout") {
      logout.mutate();
      return;
    }

    navigate({ to: item.to });
  };

  const navItemClass =
    "flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 font-medium hover:bg-slate-300/80";

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-40",
        "border-b border-border",
        "bg-background/95 backdrop-blur shadow-xs",
        "supports-backdrop-filter:bg-background/80",
      )}
    >
      <nav className="container mx-auto flex h-(--navbar-height) items-center justify-between px-5">
        <Button
          variant="link"
          className={cn(
            "flex items-center gap-2 border-0 p-0",
            "text-xl font-bold text-gray-900 dark:text-gray-200",
          )}
          onClick={() => navigate({ to: brandTo })}
          aria-label={`${config.brand.label} home`}
        >
          {BrandIcon && <BrandIcon className="size-6" />}
          {config.brand.label}
        </Button>

        <div className="hidden items-center gap-4 sm:flex">
          {primaryLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Button
                key={item.to}
                variant={active ? "link" : "outline"}
                className={cn(navItemClass, active && "bg-secondary font-bold")}
                aria-label={item.ariaLabel}
                onClick={() => handleNavItem(item)}
              >
                {Icon && <Icon className="size-4" />}
                {item.label}
              </Button>
            );
          })}

          {accountLinks.length > 0 && (
            <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={navItemClass}
                  aria-label="Account"
                >
                  <Cog className="size-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {accountLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <DropdownMenuItem
                      key={item.to}
                      aria-label={item.ariaLabel}
                      className={active ? "bg-slate-300/80 font-bold" : ""}
                      onClick={() => {
                        setAccountOpen(false);
                        handleNavItem(item);
                      }}
                    >
                      {Icon && <Icon className="size-4" />}
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {mobileLinks.length > 0 && (
          <div className="sm:hidden">
            <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-lg" aria-label="Menu">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {mobileLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <DropdownMenuItem
                      key={item.to}
                      aria-label={item.ariaLabel}
                      className={active ? "bg-slate-300/80 font-bold" : ""}
                      onClick={() => {
                        setMobileOpen(false);
                        handleNavItem(item);
                      }}
                    >
                      {Icon && <Icon className="size-4" />}
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </nav>
    </header>
  );
}
