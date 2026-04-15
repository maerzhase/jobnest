import type { Meta, StoryObj } from "@storybook/react";
import { Field } from "../components/field";
import { Input } from "../components/input";

const meta: Meta<typeof Field> = {
  title: "Primitives/Field",
  component: Field,
  args: {
    description: "Shown beside the label for brief helper context.",
    label: "Company",
    name: "company",
    required: false,
  },
  argTypes: {
    required: {
      control: "boolean",
    },
    invalid: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Field {...args}>
        <Input placeholder="Acme Inc." />
      </Field>
    </div>
  ),
};

export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>
        <Input placeholder="Acme Inc." />
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  args: {
    error: "Company is required.",
    required: true,
  },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>
        <Input invalid placeholder="Acme Inc." />
      </Field>
    </div>
  ),
};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
    label: "Role",
  },
  render: (args) => (
    <div className="w-80">
      <Field {...args}>
        <Input defaultValue="Frontend Engineer" />
      </Field>
    </div>
  ),
};
