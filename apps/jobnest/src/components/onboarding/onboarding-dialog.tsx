"use client";

import {
  IconArrowLeft,
  IconBrain,
  IconChevronRight,
  IconLayoutKanban,
} from "@tabler/icons-react";
import { Button, Dialog, DialogContent } from "@jobnest/ui";
import { openUrl } from "@tauri-apps/plugin-opener";
import Image from "next/image";
import { useEffect, useState } from "react";

type Step = {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: React.ReactNode;
};

const STEPS: Step[] = [
  {
    icon: <Image src="/icon-transparent.png" alt="" aria-hidden="true" width={40} height={40} className="size-10 object-contain" />,
    title: "Welcome to JobNest",
    description: "Your job search, entirely on your device.",
    detail:
      "No account. No cloud. No tracking. Everything you log stays on your machine — private by default, not by policy.",
  },
  {
    icon: <IconLayoutKanban className="size-7" />,
    title: "One place for every application",
    description: "From first save to final answer.",
    detail:
      "Add the company, role, contacts, notes, and tasks as things develop. Move each application through its stages — Saved, Applied, Interview, Offer, or Rejected — as you go.",
  },
  {
    icon: <IconBrain className="size-7" />,
    title: "Already tracking elsewhere?",
    description: "No manual re-entry.",
    detail: (
      <>
        Point any LLM at{" "}
        <button
          className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          onClick={() => void openUrl("https://jobnest.m3000.io/llm.txt")}
          type="button"
        >
          jobnest.m3000.io/llm.txt
        </button>{" "}
        and share your existing spreadsheet or export. It converts everything into the right format. Then Settings → Data → Import — and you're in.
      </>
    ),
  },
];

type OnboardingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export function OnboardingDialog({
  isOpen,
  onClose,
  onComplete,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => undefined}>
      <DialogContent className="max-w-md" aria-label="Getting started">
        <div className="flex flex-col gap-6">
          {/* Step dots + skip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                aria-label={`Go to step ${i + 1}`}
                className={[
                  "h-1.5 rounded-full transition-all duration-200 cursor-pointer",
                  i === step
                    ? "w-6 bg-foreground hover:opacity-75"
                    : i < step
                      ? "w-3 bg-foreground/40 hover:bg-foreground/60"
                      : "w-3 bg-muted-foreground/25 hover:bg-muted-foreground/45",
                ].join(" ")}
                onClick={() => setStep(i)}
                type="button"
              />
            ))}
            </div>
            {!isLast && (
              <button
                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                onClick={onClose}
                type="button"
              >
                Skip onboarding
              </button>
            )}
          </div>

          {/* Step content */}
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              {current.icon}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {current.title}
              </h2>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground/80">
              {current.description}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {current.detail}
            </p>
          </div>

          {/* Footer: back + next (right) */}
          <div className="flex items-center justify-end pt-1">
            <div className="flex items-center gap-2">
              <Button
                aria-label="Previous step"
                className={isFirst ? "invisible" : undefined}
                disabled={isFirst}
                onClick={() => setStep((s) => s - 1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <IconArrowLeft aria-hidden="true" className="size-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                type="button"
                variant="primary"
              >
                {isLast ? "Get started" : "Next"}
                {!isLast && (
                  <IconChevronRight aria-hidden="true" className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
