import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Hero.tsx
export function Hero({ title, subtitle }) {
  return _jsx("section", {
    className: "w-full py-20 bg-gray-700 text-background",
    children: _jsxs("div", {
      className:
        "max-w-5xl mx-auto flex flex-col items-center justify-center px-8",
      children: [
        _jsx("h1", {
          className:
            "text-5xl md:text-6xl font-extrabold text-center tracking-tight leading-snug",
          children: title,
        }),
        _jsx("p", {
          className:
            "max-w-[40ch] text-center font-medium text-xl tracking-tight leading-relaxed",
          children: subtitle,
        }),
      ],
    }),
  });
}
