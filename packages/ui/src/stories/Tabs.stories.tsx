import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
  type TabsProps,
} from "../components/tabs";

type ExampleTab = "applications" | "dashboard" | "history";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
  args: {
    defaultValue: "applications",
  },
};

export default meta;

type Story = StoryObj<TabsProps>;

function HorizontalTabsExample(args: TabsProps) {
  return (
    <Tabs {...args}>
      <TabsList className="rounded-xl border border-border/80 bg-black/[0.03] dark:bg-white/[0.04]">
        <TabsIndicator />
        <TabsTab value="applications">Applications</TabsTab>
        <TabsTab value="dashboard">Dashboard</TabsTab>
        <TabsTab value="history">History</TabsTab>
      </TabsList>
      <TabsPanel className="pt-4" value="applications">
        Applications overview
      </TabsPanel>
      <TabsPanel className="pt-4" value="dashboard">
        Dashboard insights
      </TabsPanel>
      <TabsPanel className="pt-4" value="history">
        History archive
      </TabsPanel>
    </Tabs>
  );
}

export const Default: Story = {
  render: HorizontalTabsExample,
};

export const Indicator: Story = {
  render: () => (
    <Tabs defaultValue="applications" variant="indicator">
      <TabsList>
        <TabsIndicator />
        <TabsTab value="applications">Applications</TabsTab>
        <TabsTab value="dashboard">Dashboard</TabsTab>
        <TabsTab value="history">History</TabsTab>
      </TabsList>
      <TabsPanel className="pt-4" value="applications">
        Applications overview
      </TabsPanel>
      <TabsPanel className="pt-4" value="dashboard">
        Dashboard insights
      </TabsPanel>
      <TabsPanel className="pt-4" value="history">
        History archive
      </TabsPanel>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="applications" orientation="vertical" variant="surface">
      <TabsList className="w-fit">
        <TabsIndicator />
        <TabsTab value="applications">Applications</TabsTab>
        <TabsTab value="dashboard">Dashboard</TabsTab>
        <TabsTab value="history">History</TabsTab>
      </TabsList>
      <TabsPanel value="applications" />
      <TabsPanel value="dashboard" />
      <TabsPanel value="history" />
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<ExampleTab>("dashboard");

    return (
      <div className="grid gap-3">
        <Tabs
          value={value}
          onValueChange={(nextValue) => setValue(nextValue as ExampleTab)}
        >
          <TabsList className="rounded-xl border border-border/80 bg-black/[0.03] dark:bg-white/[0.04]">
            <TabsIndicator />
            <TabsTab value="applications">Applications</TabsTab>
            <TabsTab value="dashboard">Dashboard</TabsTab>
            <TabsTab value="history">History</TabsTab>
          </TabsList>
          <TabsPanel value="applications" />
          <TabsPanel value="dashboard" />
          <TabsPanel value="history" />
        </Tabs>
        <p className="text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};
