import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorPage } from "@/components/error/ErrorPage";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const Route = createRootRoute({
  notFoundComponent: () => <ErrorPage status={404} />,
  component: () => (
    <>
      <Navbar />
      <main className="flex flex-col flex-1">
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
