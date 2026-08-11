import { createRootRoute, isNotFound, Outlet } from "@tanstack/react-router";
import { ErrorPage } from "@/components/errors/ErrorPage";
import { isRpcError } from "@/lib/rpcError";
import { Navbar } from "@/components/app/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  notFoundComponent: () => <ErrorPage status={404} />,

  errorComponent: ({ error }) => {
    if (isNotFound(error)) return <ErrorPage status={404} />;
    if (isRpcError(error)) return <ErrorPage status={error.status} />;
    return <ErrorPage status={500} />;
  },

  component: () => {
    return (
      <div className="flex min-h-svh flex-col">
        <Navbar />
        <main className="relative flex flex-1 flex-col">
          <Outlet />
        </main>
        <Toaster />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </div>
    );
  },
});
