"use client";

import {
  SETTINGS_SECTIONS,
  type SettingsSection,
} from "../../lib/settings";

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
        <h2 className="text-base font-semibold tracking-tight">
          Settings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          Choose a section from the sidebar.
        </p>
      </div>

      <nav aria-label="Settings sections" className="grid gap-1">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = section.value === activeSection;

          return (
            <button
              className={[
                "border-l px-0 py-3 pl-4 text-left transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              ].join(" ")}
              key={section.value}
              onClick={() => onSectionChange(section.value)}
              type="button"
            >
              <span className="block text-sm font-medium">
                {section.label}
              </span>
              <span
                className={[
                  "mt-1 block text-xs leading-5",
                  isActive
                    ? "text-foreground/65"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {section.description}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
