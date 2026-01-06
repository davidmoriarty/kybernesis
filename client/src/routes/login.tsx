import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate(
            { email, password },
            { onSuccess: () => navigate({ to: "/me" }) },
          );
        }}
      >
        <h1 className="text-2xl font-bold text-center mb-8">Login</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {login.error && (
          <p className="text-sm text-destructive">{login.error.message}</p>
        )}

        <Button
          type="submit"
          className="w-full mx-auto"
          disabled={login.isPending}
        >
          {login.isPending ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
