import { useEffect, useMemo, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/button";
import { createToastManager, ToastProvider } from "../components/toast";

const meta: Meta<typeof ToastProvider> = {
  title: "Primitives/Toast",
  component: ToastProvider,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof ToastProvider>;

function ToastDemo({
  showInitialToasts = false,
}: {
  showInitialToasts?: boolean;
}) {
  const toastManager = useMemo(() => createToastManager(), []);
  const initialized = useRef(false);

  useEffect(() => {
    if (!showInitialToasts || initialized.current) {
      return;
    }

    initialized.current = true;
    toastManager.add({
      title: "Application saved",
      description: "Your changes were written to the local database.",
      timeout: 0,
      type: "success",
    });
    toastManager.add({
      title: "Interview reminder",
      description: "Prepare notes before tomorrow's panel.",
      timeout: 0,
      type: "warning",
    });
    toastManager.add({
      title: "Sync failed",
      description: "Check the connection and try again.",
      priority: "high",
      timeout: 0,
      type: "error",
    });
  }, [showInitialToasts, toastManager]);

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex min-h-96 items-center justify-center gap-3 p-8">
        <Button
          onClick={() =>
            toastManager.add({
              title: "Application saved",
              description: "Your latest edits are now reflected in the list.",
              timeout: 4000,
              type: "success",
            })
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            toastManager.add({
              title: "Incomplete profile",
              description: "Add a company website before exporting.",
              timeout: 5000,
              type: "warning",
            })
          }
          variant="secondary"
        >
          Warning
        </Button>
        <Button
          onClick={() =>
            toastManager.add({
              actionProps: {
                children: "Retry",
                onClick: () =>
                  toastManager.add({
                    title: "Retry queued",
                    timeout: 3000,
                    type: "success",
                  }),
              },
              title: "Import failed",
              description: "The selected file could not be parsed.",
              priority: "high",
              timeout: 6000,
              type: "error",
            })
          }
          variant="ghost"
        >
          Error
        </Button>
        <Button onClick={() => toastManager.close()} variant="secondary">
          Clear
        </Button>
      </div>
    </ToastProvider>
  );
}

export const Playground: Story = {
  render: () => <ToastDemo />,
};

export const Types: Story = {
  render: () => <ToastDemo showInitialToasts />,
};
