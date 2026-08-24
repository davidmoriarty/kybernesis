// client/src/components/errors/ErrorPage.tsx
import { PageState } from "@/components/shared/PageState";
import { Button } from "@/components/ui/button";

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
    <PageState>
      <h1 className="text-5xl font-extrabold mb-4 text-center">{status}</h1>
      <h2 className="text-2xl font-bold mb-2 text-center">
        {title ?? defaults.title}
      </h2>
      <p className="text-lg mb-6 text-center">{message ?? defaults.message}</p>

      {status === 401 && (
        <div className="flex justify-center">
          <Button asChild variant="solid">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      )}
    </PageState>
  );
}
