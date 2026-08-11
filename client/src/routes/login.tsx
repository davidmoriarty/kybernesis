// client/src/routes/login.tsx

import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageCard } from "@/components/shared/PageCard";
import { getCurrentHostContext } from "@/lib/tenantHost";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { surface } = getCurrentHostContext();

    if (surface === "public") {
      throw notFound();
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { surface } = getCurrentHostContext();

  const isAdmin = surface === "admin";

  return (
    <PageCard>
      <LoginForm
        title={isAdmin ? "Admin Login" : "Log in"}
        description={
          isAdmin
            ? "Sign in to manage your organization"
            : "Sign in to continue to your workspace"
        }
        onSuccess={() =>
          navigate({
            to: isAdmin ? "/admin" : "/projects",
          })
        }
      />
    </PageCard>
  );
}
