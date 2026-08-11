// client/src/components/auth/LoginForm.tsx

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/auth";
import { FormLayout } from "@/components/shared/FormLayout";

type LoginFormProps = {
  title: string;
  description: string;
  onSuccess: () => void;
};

export function LoginForm({ title, description, onSuccess }: LoginFormProps) {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    login.mutate({ email, password }, { onSuccess });
  };

  return (
    <FormLayout title={title} description={description} onSubmit={handleSubmit}>
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className="w-full rounded-sm border p-2"
        required
      />

      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className="w-full rounded-sm border p-2"
        required
      />

      {login.error instanceof Error && (
        <p className="text-sm text-destructive">{login.error.message}</p>
      )}

      <Button type="submit" className="mt-4 w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Login"}
      </Button>
    </FormLayout>
  );
}
