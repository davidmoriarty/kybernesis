import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorPage } from "@/components/error/ErrorPage";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  notFoundComponent: () => <ErrorPage status={404} />,
  component: () => {
    return (
      <div className="min-h-full flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>

        <Toaster />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </div>
    );
  },
});
