import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// DeleteProjectDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
export function DeleteProjectDialog({ onConfirm, disabled }) {
  return _jsxs(AlertDialog, {
    children: [
      _jsx(AlertDialogTrigger, {
        asChild: true,
        children: _jsx(Button, {
          size: "sm",
          variant: "destructive",
          disabled: disabled,
          onClick: (e) => {
            e.stopPropagation();
          },
          children: "Delete",
        }),
      }),
      _jsxs(AlertDialogContent, {
        children: [
          _jsxs(AlertDialogHeader, {
            children: [
              _jsx(AlertDialogTitle, { children: "Delete Project" }),
              _jsx(AlertDialogDescription, {
                children:
                  "Are you sure you want to delete this project? This action cannot be undone.",
              }),
            ],
          }),
          _jsxs(AlertDialogFooter, {
            className: "flex gap-2",
            children: [
              _jsx(AlertDialogCancel, {
                onClick: (e) => {
                  e.stopPropagation();
                },
                children: "Cancel",
              }),
              _jsx(AlertDialogAction, {
                onClick: (e) => {
                  e.stopPropagation();
                  onConfirm();
                },
                children: "Delete",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
