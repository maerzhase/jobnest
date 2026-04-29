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
    <aside className="lg:border-r lg:border-border lg:pr-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
          Settings
        </h2>
      </div>

      <Tabs
        aria-label="Settings sections"
        onValueChange={(value) => onSectionChange(value as SettingsSection)}
        orientation="vertical"
        size="sm"
        value={activeSection}
        variant="indicator"
      >
        <TabsList className="w-full p-0">
          <TabsIndicator />
          {SETTINGS_SECTIONS.map((section) => (
            <TabsTab
              className="min-w-0 flex-col items-start gap-0 justify-start px-0 py-2.5 pl-4 text-left data-[orientation=vertical]:rounded-none"
              key={section.value}
              value={section.value}
            >
              <span className="block text-sm font-medium leading-5">
                {section.label}
              </span>
              <span className="mt-0.5 block text-xs leading-4 text-current/65">
                {section.description}
              </span>
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </aside>
  );
}
