import type { Meta, StoryObj } from "@storybook/react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTriggerButton,
} from "../components/collapsible";

const meta: Meta<typeof Collapsible> = {
  title: "Primitives/Collapsible",
  component: Collapsible,
  args: {
    defaultOpen: true,
  },
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96 rounded-lg border border-border bg-card">
      <Collapsible {...args}>
        <CollapsibleTriggerButton>
          <span>
            <span className="block text-sm font-medium">Offer details</span>
            <span className="block text-xs text-muted-foreground">
              Compensation, location, and notes
            </span>
          </span>
          <ChevronIcon />
        </CollapsibleTriggerButton>
        <CollapsiblePanel>
          <div className="border-border border-t px-4 py-3 text-sm leading-6 text-muted-foreground">
            Remote-first role with a Lisbon-friendly schedule, equity refreshes,
            and a final interview expected next week.
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  ),
};

export const ClosedByDefault: Story = {
  args: {
    defaultOpen: false,
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: Default.render,
};

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M4 6.25L8 10.25L12 6.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
