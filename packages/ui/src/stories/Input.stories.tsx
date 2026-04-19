import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../components/input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  args: {
    placeholder: "Search applications",
  },
  argTypes: {
    invalid: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    type: {
      control: "select",
      options: ["text", "email", "number", "password", "url"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: "Product Designer",
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "not-a-url",
    invalid: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "Archived application",
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};
