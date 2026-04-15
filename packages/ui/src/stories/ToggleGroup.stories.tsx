import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupProps,
} from "../components/toggle-group";

type ViewMode = "list" | "board" | "calendar";

const meta: Meta<typeof ToggleGroup<ViewMode>> = {
  title: "Primitives/ToggleGroup",
  component: ToggleGroup<ViewMode>,
  args: {
    defaultValue: "list",
  },
};

export default meta;

type Story = StoryObj<ToggleGroupProps<ViewMode>>;

function ToggleGroupExample(args: ToggleGroupProps<ViewMode>) {
  return (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="board">Board</ToggleGroupItem>
      <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
    </ToggleGroup>
  );
}

export const Default: Story = {
  render: ToggleGroupExample,
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<ViewMode>("board");

    return (
      <div className="grid gap-3">
        <ToggleGroup
          value={value}
          onValueChange={(nextValue) => nextValue && setValue(nextValue)}
        >
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};

export const WithDisabledItem: Story = {
  render: () => (
    <ToggleGroup defaultValue="list">
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem disabled value="board">
        Board
      </ToggleGroupItem>
      <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
    </ToggleGroup>
  ),
};
