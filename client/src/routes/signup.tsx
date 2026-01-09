import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Container } from "@/components/Container";
import { FormLayout } from "@/components/FormLayout";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/hooks/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signup.mutateAsync({ email, password });
    navigate({ to: "/projects" });
  };

  return (
    <>
      <Hero title="Sign Up" />

      <Section>
        <Container className="max-w-md">
          <FormLayout
            title="Sign Up"
            description="Create a new account"
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
              autoComplete="new-password"
              className="w-full border p-2 rounded"
              required
            />

            {signup.error instanceof Error && (
              <p className="text-sm text-destructive">{signup.error.message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={signup.isPending}
            >
              {signup.isPending ? "Signing up..." : "Sign up"}
            </Button>
          </FormLayout>
        </Container>
      </Section>
    </>
  );
}
