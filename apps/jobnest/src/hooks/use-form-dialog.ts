"use client";

import { useCallback, useState } from "react";

type UseFormDialogState = {
  isOpen: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
};

type UseFormDialogReturn = UseFormDialogState & {
  open: () => void;
  close: (force?: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setDeleting: (isDeleting: boolean) => void;
};

/**
 * Hook to manage form dialog state (open/close, loading states)
 * Prevents closing while submitting or deleting
 */
export function useFormDialog(): UseFormDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const close = useCallback(
    (force = false) => {
      if (!force && (isSubmitting || isDeleting)) {
        return;
      }

      setIsOpen(false);
      setSubmitting(false);
      setDeleting(false);
    },
    [isSubmitting, isDeleting]
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setSubmitting(false);
    setDeleting(false);
  }, []);

  return {
    isOpen,
    isSubmitting,
    isDeleting,
    open,
    close,
    setSubmitting,
    setDeleting,
  };
}
