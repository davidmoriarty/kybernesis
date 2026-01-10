// ErrorPage.tsx
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";

interface ErrorPageProps {
  status: number;
  title?: string;
  message?: string;
}

export function ErrorPage({ status, title, message }: ErrorPageProps) {
  const defaultMessages: Record<number, { title: string; message: string }> = {
    400: { title: "Bad Request", message: "You made an invalid data request." },
    401: {
      title: "Unauthorized",
      message: "You need to log in to access this page.",
    },
    403: {
      title: "Forbidden",
      message: "You do not have permission to access this page.",
    },
    404: {
      title: "Not Found",
      message: "The page you are looking for does not exist.",
    },
    500: {
      title: "Internal Server Error",
      message: "Something went wrong on our end.",
    },
  };

  const defaults = defaultMessages[status] ?? {
    title: "Error",
    message: "An unexpected error occurred.",
  };

  return (
    <Section className="min-h-screen flex flex-col items-center justify-center">
      <Container>
        <h1 className="text-5xl font-extrabold text-center">{status}</h1>
        <h2 className="text-2xl font-bold text-center">
          {title ?? defaults.title}
        </h2>
        <p className="text-lg text-center mb-6">
          {message ?? defaults.message}
        </p>
        {status === 401 && (
          <div className="flex items-center justify-center">
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        )}
      </Container>
    </Section>
  );
}
