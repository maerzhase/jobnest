"use client";

import { createToastManager } from "@jobnest/ui";
import { reportIssue } from "./feedback";

export const appToastManager = createToastManager();

type ToastOptions = {
  title: string;
  description?: string;
};

const TOAST_TIMEOUTS = {
  success: 3000,
  warning: 5000,
  error: 6000,
} as const;

export function showSuccessToast({ title, description }: ToastOptions): void {
  appToastManager.add({
    title,
    description,
    timeout: TOAST_TIMEOUTS.success,
    type: "success",
  });
}

export function showWarningToast({ title, description }: ToastOptions): void {
  appToastManager.add({
    title,
    description,
    timeout: TOAST_TIMEOUTS.warning,
    type: "warning",
  });
}

export function showErrorToast({ title, description }: ToastOptions): void {
  appToastManager.add({
    actionProps: {
      children: "Report issue",
      onClick: () => {
        void reportIssue({ errorMessage: description ?? title });
      },
    },
    title,
    description,
    priority: "high",
    timeout: TOAST_TIMEOUTS.error,
    type: "error",
  });
}
