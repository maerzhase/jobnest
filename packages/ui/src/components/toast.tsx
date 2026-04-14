"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

type ToastProviderRootProps = ComponentPropsWithoutRef<
  typeof BaseToast.Provider
>;

function ToastViewportRenderer(): JSX.Element {
  const { toasts } = BaseToast.useToastManager();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className="pointer-events-none fixed right-4 bottom-4 z-[100] w-[min(28rem,calc(100vw-2rem))] max-w-full outline-none sm:right-6 sm:bottom-6">
        {toasts.map((toast) => (
          <BaseToast.Root
            key={toast.id}
            className={cn(
              "pointer-events-auto absolute right-0 bottom-0 left-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xl shadow-black/10 backdrop-blur-md transition-[transform,opacity,box-shadow] duration-200 ease-out",
              "[transform:translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-(0.04*var(--toast-index))))]",
              "data-[expanded]:[transform:translateY(calc((var(--toast-offset-y)+((var(--toast-index))*0.5rem))*-1))]",
              "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
              "data-[swiping]:transition-none data-[swipe-direction=right]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-(0.04*var(--toast-index))))] data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*-0.75rem)))_scale(calc(1-(0.04*var(--toast-index))))]",
              "data-[type=success]:border-emerald-500/35 data-[type=success]:bg-emerald-500/10",
              "data-[type=warning]:border-amber-500/35 data-[type=warning]:bg-amber-500/10",
              "data-[type=error]:border-red-500/35 data-[type=error]:bg-red-500/10",
            )}
            style={{ zIndex: `calc(100 - var(--toast-index))` }}
            toast={toast}
          >
            <BaseToast.Content className="flex items-start gap-3 overflow-hidden p-4 transition-opacity duration-200 data-[behind]:opacity-0 data-[expanded]:opacity-100">
              <div
                aria-hidden="true"
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full bg-foreground/30",
                  "data-[type=success]:bg-emerald-500",
                  "data-[type=warning]:bg-amber-500",
                  "data-[type=error]:bg-red-500",
                )}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <BaseToast.Title className="text-sm font-semibold leading-5" />
                <BaseToast.Description className="text-sm leading-5 text-muted-foreground" />
                {toast.actionProps ? (
                  <BaseToast.Action className="mt-2 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" />
                ) : null}
              </div>
              <BaseToast.Close className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
                <span className="sr-only">Dismiss notification</span>
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

export interface ToastProviderProps extends ToastProviderRootProps {
  children: ReactNode;
}

export function ToastProvider({
  children,
  ...props
}: ToastProviderProps): JSX.Element {
  return (
    <BaseToast.Provider {...props}>
      {children}
      <ToastViewportRenderer />
    </BaseToast.Provider>
  );
}

export const createToastManager = BaseToast.createToastManager;
export type ToastManager = ReturnType<typeof createToastManager>;
