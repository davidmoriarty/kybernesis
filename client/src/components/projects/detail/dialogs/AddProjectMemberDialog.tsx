// client/src/components/projects/detail/dialogs/AddProjectMemberDialog.tsx

import { type SyntheticEvent, useState } from "react";
import { useAddProjectMember } from "@/hooks/projectMembers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddProjectMemberDialogProps {
  projectId: string;
}

export function AddProjectMemberDialog({
  projectId,
}: AddProjectMemberDialogProps) {
  const addProjectMember = useAddProjectMember(projectId);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    try {
      await addProjectMember.mutateAsync({ email: trimmedEmail });
      setEmail("");
      setOpen(false);
    } catch {
      // Toast is handled by useAddProjectMember.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="solid"
          color="primary"
          size="md"
          className="w-full sm:w-auto"
        >
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card text-card-foreground sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add project member</DialogTitle>
            <DialogDescription>
              Add a user to this project by email address.
            </DialogDescription>
          </DialogHeader>

          <div className="my-8">
            <Label htmlFor="member-email" className="sr-only">
              Email address
            </Label>

            <Input
              id="member-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="solid" color="secondary" size="md">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              size="md"
              disabled={addProjectMember.isPending || !email.trim()}
            >
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
