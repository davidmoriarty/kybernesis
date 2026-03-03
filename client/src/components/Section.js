import { jsx as _jsx } from "react/jsx-runtime";
// Section.tsx
export function Section({ children, padding = "py-8", className = "" }) {
  return _jsx("section", {
    className: `w-full ${padding} ${className}`,
    children: children,
  });
}
