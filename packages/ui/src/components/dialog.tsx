"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

type DialogRootProps = ComponentPropsWithoutRef<typeof BaseDialog.Root>;
type DialogTriggerProps = ComponentPropsWithoutRef<typeof BaseDialog.Trigger>;
type DialogCloseProps = ComponentPropsWithoutRef<typeof BaseDialog.Close>;
type DialogTitleProps = ComponentPropsWithoutRef<typeof BaseDialog.Title>;
type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Description
>;
type DialogPopupProps = ComponentPropsWithoutRef<typeof BaseDialog.Popup>;

export function Dialog(props: DialogRootProps): JSX.Element {
  return <BaseDialog.Root {...props} />;
}

export interface DialogTriggerButtonProps
  extends Omit<DialogTriggerProps, "className"> {
  className?: string;
}

export function DialogTriggerButton({
  className,
  ...props
}: DialogTriggerButtonProps): JSX.Element {
  return (
    <BaseDialog.Trigger
      {...props}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}

export interface DialogContentProps extends Omit<DialogPopupProps, "className"> {
  children: ReactNode;
  className?: string;
}

export function DialogContent({
  children,
  className,
  ...props
}: DialogContentProps): JSX.Element {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <BaseDialog.Popup
          {...props}
          className={cn(
            "bg-card border-border w-full max-w-xl rounded-md border p-6 shadow-xl shadow-black/20 outline-none transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
        >
          {children}
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
}

export interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DialogHeader({
  children,
  className,
}: DialogHeaderProps): JSX.Element {
  return <div className={cn("mb-6 space-y-2", className)}>{children}</div>;
}

export interface DialogTitleTextProps extends Omit<DialogTitleProps, "className"> {
  className?: string;
}

export function DialogTitleText({
  className,
  ...props
}: DialogTitleTextProps): JSX.Element {
  return (
    <BaseDialog.Title
      {...props}
      className={cn("text-2xl font-semibold tracking-tight", className)}
    />
  );
}

export interface DialogDescriptionTextProps
  extends Omit<DialogDescriptionProps, "className"> {
  className?: string;
}

export function DialogDescriptionText({
  className,
  ...props
}: DialogDescriptionTextProps): JSX.Element {
  return (
    <BaseDialog.Description
      {...props}
      className={cn("text-muted-foreground text-sm leading-6", className)}
    />
  );
}

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({
  children,
  className,
}: DialogFooterProps): JSX.Element {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}

export interface DialogCloseButtonProps
  extends Omit<DialogCloseProps, "className"> {
  className?: string;
}

export function DialogCloseButton({
  className,
  ...props
}: DialogCloseButtonProps): JSX.Element {
  return (
    <BaseDialog.Close
      {...props}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}
