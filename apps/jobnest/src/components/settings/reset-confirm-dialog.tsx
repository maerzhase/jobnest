"use client";

import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTitleText,
  Field,
  Input,
} from "@jobnest/ui";

const RESET_CONFIRMATION_TEXT = "clear my data";

type ResetConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  confirmationInput: string;
  onConfirmationInputChange: (input: string) => void;
  onConfirm: () => Promise<void>;
  isResetting: boolean;
  error?: string | null;
};

export function ResetConfirmDialog({
  isOpen,
  onOpenChange,
  confirmationInput,
  onConfirmationInputChange,
  onConfirm,
  isResetting,
  error,
}: ResetConfirmDialogProps) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && isResetting) {
          return;
        }

        onOpenChange(open);
        if (!open) {
          onConfirmationInputChange("");
        }
      }}
      open={isOpen}
    >
      <DialogContent>
        <DialogHeader>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
            Confirm reset
          </p>
          <DialogTitleText>Reset the local database</DialogTitleText>
          <DialogDescriptionText>
            Type{" "}
            <span className="font-medium text-foreground">
              {RESET_CONFIRMATION_TEXT}
            </span>{" "}
            to confirm. This removes all stored application data and restores
            the default settings.
          </DialogDescriptionText>
        </DialogHeader>

        <div className="grid gap-5">
          <Field
            description="This must match the confirmation phrase exactly."
            error={error}
            label="Confirmation text"
            name="resetConfirmation"
          >
            <Input
              autoComplete="off"
              onChange={(event) => onConfirmationInputChange(event.target.value)}
              placeholder={RESET_CONFIRMATION_TEXT}
              value={confirmationInput}
            />
          </Field>

          <DialogFooter>
            <DialogCloseButton disabled={isResetting} type="button">
              Cancel
            </DialogCloseButton>
            <Button
              disabled={
                isResetting ||
                confirmationInput.trim() !== RESET_CONFIRMATION_TEXT
              }
              onClick={onConfirm}
              type="button"
              variant="secondary"
            >
              {isResetting ? "Resetting..." : "Clear my data"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
