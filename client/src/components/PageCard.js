import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/components/PageCard.tsx
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
export function PageCard({ children }) {
  return _jsx(Section, {
    children: _jsx(Container, {
      children: _jsx("div", {
        className:
          "bg-slate-200 dark:bg-slate-700 max-w-7xl mx-auto px-8 py-16 border rounded shadow",
        children: _jsx("div", {
          className: "flex flex-col gap-4",
          children: children,
        }),
      }),
    }),
  });
}
export function LoadingState({ message = "Loading..." }) {
  return _jsxs("p", {
    className: "text-center text-lg py-6",
    children: [
      _jsx("span", {
        className: "animate-spin inline-block mr-2",
        children: "\u23F3",
      }),
      message,
    ],
  });
}
export function ErrorState({ message = "Something went wrong." }) {
  return _jsx("p", {
    className: "text-center text-lg text-destructive py-6",
    children: message,
  });
}
