"use client";

import {
  AlertDialog,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescriptionText,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitleText,
  Button,
} from "@acme/ui";

type ApplicationDeleteAlertProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error?: string | null;
};

export function ApplicationDeleteAlert({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
  error,
}: ApplicationDeleteAlertProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitleText>Delete application</AlertDialogTitleText>
          <AlertDialogDescriptionText>
            Are you sure you want to delete this application? This action cannot be undone.
          </AlertDialogDescriptionText>
        </AlertDialogHeader>

        {error ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancelButton disabled={isDeleting} type="button">
            Cancel
          </AlertDialogCancelButton>
          <Button
            className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-300"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
            variant="secondary"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
