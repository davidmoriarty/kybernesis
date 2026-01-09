import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <main className="flex flex-col flex-1">
        <Outlet />
      </main>
      <Footer />
      <TanStackRouterDevtools />
    </>
  ),
});
