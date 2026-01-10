import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/Container";
import { FormLayout } from "@/components/FormLayout";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
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

  const handleSubmit = (e: React.FormEvent) => {
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
    <>
      <Hero title="Login" />

      <Section>
        <Container>
          <FormLayout
            title="Sign in to your account"
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
              className="w-full border p-2 rounded"
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
              className="w-full border p-2 rounded"
              required
            />

            {login.error instanceof Error && (
              <p className="text-sm text-destructive">{login.error.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Login"}
            </Button>
          </FormLayout>
        </Container>

        <Container className="max-w-md flex flex-row items-baseline justify-center gap-4 py-4">
          <p>Don't have an account?</p>
          <Button variant="outline" onClick={() => navigate({ to: "/signup" })}>
            <Rocket />
            Sign up
          </Button>
        </Container>
      </Section>
    </>
  );
}
