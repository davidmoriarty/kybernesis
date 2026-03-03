import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ErrorPage.tsx
import { PageCard } from "@/components/PageCard";
import { Button } from "@/components/ui/button";
export function ErrorPage({ status, title, message }) {
  const defaultMessages = {
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
  return _jsxs(PageCard, {
    children: [
      _jsx("h1", {
        className: "text-5xl font-extrabold mb-4 text-center",
        children: status,
      }),
      _jsx("h2", {
        className: "text-2xl font-bold mb-2 text-center",
        children: title ?? defaults.title,
      }),
      _jsx("p", {
        className: "text-lg mb-6 text-center",
        children: message ?? defaults.message,
      }),
      status === 401 &&
        _jsx("div", {
          className: "flex justify-center",
          children: _jsx(Button, {
            asChild: true,
            variant: "default",
            children: _jsx("a", { href: "/login", children: "Go to Login" }),
          }),
        }),
    ],
  });
}
