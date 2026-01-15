import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorPage } from "@/components/error/ErrorPage";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  notFoundComponent: () => <ErrorPage status={404} />,
  component: () => {
    return (
      <>
        <Navbar />
        <main className="flex flex-col flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </>
    );
  },
});
