"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  [
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border",
    "px-4 py-2 text-sm font-medium whitespace-nowrap",
    "transition-colors",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-60",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "border-foreground bg-foreground text-background hover:opacity-90",
        secondary: "border-input bg-background text-foreground hover:bg-muted",
      },
      size: {
        default: "h-10 has-[>svg]:px-3",
        sm: "h-9 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type BaseButtonProps = ComponentPropsWithoutRef<typeof BaseButton>;

export interface ButtonProps
  extends Omit<BaseButtonProps, "className">,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  className?: string;
}

export function Button({
  children,
  className,
  size,
  variant,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <BaseButton
      {...props}
      className={cn(buttonVariants({ size, variant }), className)}
    >
      {children}
    </BaseButton>
  );
}
