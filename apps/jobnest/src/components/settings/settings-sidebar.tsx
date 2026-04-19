"use client";

import { Tabs, TabsIndicator, TabsList, TabsTab } from "@jobnest/ui";
import { SETTINGS_SECTIONS, type SettingsSection } from "../../lib/settings";

type SettingsSidebarProps = {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
};

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <aside className="lg:border-r lg:border-border lg:pr-8">
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          Choose a section from the sidebar.
        </p>
      </div>

      <Tabs
        aria-label="Settings sections"
        onValueChange={(value) => onSectionChange(value as SettingsSection)}
        orientation="vertical"
        value={activeSection}
        variant="indicator"
      >
        <TabsList className="w-full p-0">
          <TabsIndicator />
          {SETTINGS_SECTIONS.map((section) => (
            <TabsTab
              className="min-w-0 flex-col items-start gap-0 justify-start px-0 py-3 pl-5 text-left data-[orientation=vertical]:rounded-none"
              key={section.value}
              value={section.value}
            >
              <span className="block text-sm font-medium">{section.label}</span>
              <span className="mt-1 block text-xs leading-5 text-current/65">
                {section.description}
              </span>
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </aside>
  );
}
