// client/src/routes/login.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { FormLayout } from "@/components/shared/FormLayout";
import { PageCard } from "@/components/shared/PageCard";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: "/me" });
        },
      },
    );
  };

  return (
    <PageCard>
      <FormLayout
        title="Log in"
        description="Enter your email and password to continue"
        onSubmit={handleSubmit}
      >
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full border p-2 rounded-sm"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full border p-2 rounded-sm"
          required
        />

        {login.error instanceof Error && (
          <p className="text-sm text-destructive">{login.error.message}</p>
        )}

        <Button
          type="submit"
          className="w-full mt-4"
          disabled={login.isPending}
        >
          {login.isPending ? "Signing in..." : "Login"}
        </Button>
      </FormLayout>

      <div className="flex flex-row items-center justify-center gap-4 mt-4">
        <p>Don't have an account?</p>
        <Button variant="ghost" onClick={() => navigate({ to: "/signup" })}>
          <Rocket />
          Sign up
        </Button>
      </div>
    </PageCard>
  );
}
