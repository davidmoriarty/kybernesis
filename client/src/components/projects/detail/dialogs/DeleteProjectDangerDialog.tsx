// client/src/components/projects/detail/DeleteProjectDangerDialog.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DeleteProjectDangerDialogProps {
  projectName: string;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

export function DeleteProjectDangerDialog({
  projectName,
  onConfirm,
  disabled = false,
}: DeleteProjectDangerDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");

  const isMatch = confirmValue.trim() === projectName;
  const showError = confirmValue.length > 0 && !isMatch;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setConfirmValue("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="solid" color="danger" disabled={disabled}>
          Delete Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Delete project</DialogTitle>
          <DialogDescription className="uppercase font-bold text-foreground">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4 text-foreground">
          <p>
            To confirm, type{" "}
            <span className="font-semibold italic text-destructive">
              {projectName}
            </span>{" "}
            below.
          </p>
          <Input
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder={projectName}
            autoComplete="off"
            autoFocus
          />

          {showError && (
            <p className="text-sm text-destructive">
              Project name must match exactly.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="solid"
            color="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            color="danger"
            disabled={!isMatch || disabled}
            onClick={async () => {
              try {
                await onConfirm();
                setConfirmValue("");
                setOpen(false);
              } catch {
                // let parent toast handle the error
              }
            }}
          >
            Permanently Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
