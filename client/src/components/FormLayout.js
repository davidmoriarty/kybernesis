import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FormLayout({
  children,
  title,
  description,
  className = "",
  onSubmit,
}) {
  return _jsxs("div", {
    className: `max-w-md mx-auto px-4 ${className}`,
    children: [
      title &&
        _jsx("h1", {
          className: "text-4xl font-black mb-2 text-center",
          children: title,
        }),
      description &&
        _jsx("p", {
          className: "text-center text-md text-muted-foreground mb-6",
          children: description,
        }),
      _jsx("form", {
        className: "space-y-4",
        onSubmit: onSubmit,
        children: children,
      }),
    ],
  });
}
