import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  type SelectProps,
  SelectTriggerButton,
  SelectValueText,
} from "../components/select";

const currencyOptions = [
  { label: "US dollar", value: "USD" },
  { label: "Euro", value: "EUR" },
  { label: "British pound", value: "GBP" },
  { label: "Canadian dollar", value: "CAD" },
];

const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  component: Select,
  args: {
    defaultValue: "EUR",
  },
};

export default meta;

type Story = StoryObj<SelectProps>;

function CurrencySelect(args: SelectProps) {
  return (
    <div className="w-72">
      <Select {...args}>
        <SelectTriggerButton>
          <SelectValueText placeholder="Choose a currency" />
        </SelectTriggerButton>
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const Default: Story = {
  render: CurrencySelect,
};

export const Placeholder: Story = {
  args: {
    defaultValue: undefined,
  },
  render: CurrencySelect,
};

export const Invalid: Story = {
  render: (args) => (
    <div className="w-72">
      <Select {...args}>
        <SelectTriggerButton invalid>
          <SelectValueText placeholder="Choose a currency" />
        </SelectTriggerButton>
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-72">
      <Select {...args}>
        <SelectTriggerButton disabled>
          <SelectValueText placeholder="Choose a currency" />
        </SelectTriggerButton>
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <div className="w-72">
      <Select defaultValue="USD">
        <SelectTriggerButton>
          <SelectValueText placeholder="Choose a currency" />
        </SelectTriggerButton>
        <SelectContent>
          <SelectItem value="USD">US dollar</SelectItem>
          <SelectItem disabled value="EUR">
            Euro
          </SelectItem>
          <SelectItem value="GBP">British pound</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("GBP");

    return (
      <div className="grid w-72 gap-3">
        <Select value={value} onValueChange={setValue}>
          <SelectTriggerButton>
            <SelectValueText placeholder="Choose a currency" />
          </SelectTriggerButton>
          <SelectContent>
            {currencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};
