import { createRootRoute, isNotFound, Outlet } from "@tanstack/react-router";
import { ErrorPage } from "@/components/error/ErrorPage";
import { isRpcError } from "@/lib/rpcError";
import { Navbar } from "@/components/Navbar";
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Toaster />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </div>
    );
  },
});
