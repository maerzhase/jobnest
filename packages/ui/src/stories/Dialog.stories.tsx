import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/button";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTitleText,
  DialogTriggerButton,
} from "../components/dialog";
import { Field } from "../components/field";
import { Input } from "../components/input";

const meta: Meta<typeof Dialog> = {
  title: "Primitives/Dialog",
  component: Dialog,
  args: {
    defaultOpen: false,
  },
  argTypes: {
    defaultOpen: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTriggerButton>Edit application</DialogTriggerButton>
      <DialogContent>
        <DialogHeader>
          <DialogTitleText>Edit application</DialogTitleText>
          <DialogDescriptionText>
            Update the key details for this opportunity.
          </DialogDescriptionText>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Company" name="company" required>
            <Input defaultValue="Northstar Labs" />
          </Field>
          <Field label="Role" name="role">
            <Input defaultValue="Product Engineer" />
          </Field>
        </div>
        <DialogFooter className="mt-6">
          <DialogCloseButton>Cancel</DialogCloseButton>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
  render: Default.render,
};
