"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

type AlertDialogRootProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Root>;
type AlertDialogTriggerProps = ComponentPropsWithoutRef<
  typeof BaseAlertDialog.Trigger
>;
type AlertDialogPopupProps = ComponentPropsWithoutRef<
  typeof BaseAlertDialog.Popup
>;
type AlertDialogCloseProps = ComponentPropsWithoutRef<
  typeof BaseAlertDialog.Close
>;
type AlertDialogTitleProps = ComponentPropsWithoutRef<
  typeof BaseAlertDialog.Title
>;
type AlertDialogDescriptionProps = ComponentPropsWithoutRef<
  typeof BaseAlertDialog.Description
>;

export function AlertDialog(props: AlertDialogRootProps): JSX.Element {
  return <BaseAlertDialog.Root {...props} />;
}

export interface AlertDialogTriggerButtonProps
  extends Omit<AlertDialogTriggerProps, "className"> {
  className?: string;
}

export function AlertDialogTriggerButton({
  className,
  ...props
}: AlertDialogTriggerButtonProps): JSX.Element {
  return (
    <BaseAlertDialog.Trigger
      {...props}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}

export interface AlertDialogContentProps
  extends Omit<AlertDialogPopupProps, "className"> {
  children: ReactNode;
  className?: string;
}

export function AlertDialogContent({
  children,
  className,
  ...props
}: AlertDialogContentProps): JSX.Element {
  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <BaseAlertDialog.Popup
          {...props}
          className={cn(
            "bg-card border-border w-full max-w-sm rounded-md border p-6 shadow-xl shadow-black/20 outline-none transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
        >
          {children}
        </BaseAlertDialog.Popup>
      </div>
    </BaseAlertDialog.Portal>
  );
}

export interface AlertDialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export function AlertDialogHeader({
  children,
  className,
}: AlertDialogHeaderProps): JSX.Element {
  return <div className={cn("mb-4 space-y-2", className)}>{children}</div>;
}

export interface AlertDialogTitleTextProps
  extends Omit<AlertDialogTitleProps, "className"> {
  className?: string;
}

export function AlertDialogTitleText({
  className,
  ...props
}: AlertDialogTitleTextProps): JSX.Element {
  return (
    <BaseAlertDialog.Title
      {...props}
      className={cn("text-lg font-semibold tracking-tight", className)}
    />
  );
}

export interface AlertDialogDescriptionTextProps
  extends Omit<AlertDialogDescriptionProps, "className"> {
  className?: string;
}

export function AlertDialogDescriptionText({
  className,
  ...props
}: AlertDialogDescriptionTextProps): JSX.Element {
  return (
    <BaseAlertDialog.Description
      {...props}
      className={cn("text-muted-foreground text-sm leading-6", className)}
    />
  );
}

export interface AlertDialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function AlertDialogFooter({
  children,
  className,
}: AlertDialogFooterProps): JSX.Element {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}

export interface AlertDialogCancelButtonProps
  extends Omit<AlertDialogCloseProps, "className"> {
  className?: string;
}

export function AlertDialogCancelButton({
  className,
  ...props
}: AlertDialogCancelButtonProps): JSX.Element {
  return (
    <BaseAlertDialog.Close
      {...props}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}
