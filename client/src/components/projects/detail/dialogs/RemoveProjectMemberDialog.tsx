// client/src/components/projects/detail/RemoveProjectMemberDialog.tsx
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

interface RemoveProjectMemberDialogProps {
  memberName: string;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

export function RemoveProjectMemberDialog({
  memberName,
  onConfirm,
  disabled = false,
}: RemoveProjectMemberDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          Remove
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Remove Member</DialogTitle>
          <DialogDescription>
            Remove <span className="font-semibold">{memberName}</span> from this
            project? They will immediately lose access.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await onConfirm();
                setOpen(false);
              } catch {
                // parent handles toast/error
              }
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
