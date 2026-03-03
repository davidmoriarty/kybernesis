import { jsx as _jsx } from "react/jsx-runtime";
// Container.tsx
export function Container({ children, className = "" }) {
  return _jsx("div", {
    className: `container mx-auto px-8 ${className}`,
    children: children,
  });
}
