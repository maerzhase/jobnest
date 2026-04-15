import type { Meta, StoryObj } from "@storybook/react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import {
  AlertDialog,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescriptionText,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitleText,
  AlertDialogTriggerButton,
} from "../components/alert-dialog";
import { Button } from "../components/button";

const meta: Meta<typeof AlertDialog> = {
  title: "Primitives/AlertDialog",
  component: AlertDialog,
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

type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTriggerButton>Delete application</AlertDialogTriggerButton>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitleText>Delete application</AlertDialogTitleText>
          <AlertDialogDescriptionText>
            This removes the application from your tracker. The action cannot be
            undone.
          </AlertDialogDescriptionText>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton>Cancel</AlertDialogCancelButton>
          <BaseAlertDialog.Close render={<Button>Delete</Button>} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
  render: Default.render,
};
