import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// SettingsSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
export default function SettingsSection({ notificationsEnabled, isPublic }) {
  if (notificationsEnabled === undefined && isPublic === undefined) {
    return _jsx("div", {
      className: "flex flex-col gap-4",
      children: [1, 2].map((i) =>
        _jsxs(
          Card,
          {
            className: "p-4 flex items-center gap-4",
            children: [
              _jsx(Skeleton, { className: "h-4 w-32" }),
              _jsx(Skeleton, { className: "h-4 w-10" }),
            ],
          },
          i,
        ),
      ),
    });
  }
  const settings = [
    { label: "Enable Notifications", value: notificationsEnabled },
    { label: "Public Project", value: isPublic },
  ];
  return _jsx("div", {
    className: "flex flex-col gap-4",
    children: settings.map((item) =>
      _jsxs(
        Card,
        {
          className: "p-4 flex items-center justify-between",
          children: [
            _jsx("p", { className: "font-medium", children: item.label }),
            _jsx(Switch, { checked: item.value }),
          ],
        },
        item.label,
      ),
    ),
  });
}
