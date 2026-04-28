"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";

type WindowDragSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  dragHeight?: number;
};

const DEFAULT_DRAG_HEIGHT = 64;

const INTERACTIVE_TAG_NAMES = new Set([
  "A",
  "BUTTON",
  "INPUT",
  "LABEL",
  "OPTION",
  "SELECT",
  "SUMMARY",
  "TEXTAREA",
]);

const INTERACTIVE_ROLES = new Set([
  "button",
  "checkbox",
  "combobox",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
]);

function isInteractiveElement(root: HTMLElement, target: HTMLElement) {
  for (
    let current: HTMLElement | null = target;
    current && root.contains(current);
    current = current.parentElement
  ) {
    if (current.dataset.windowDragExempt !== undefined) {
      return true;
    }

    if (current.isContentEditable || current.tabIndex >= 0) {
      return true;
    }

    if (INTERACTIVE_TAG_NAMES.has(current.tagName)) {
      return true;
    }

    const role = current.getAttribute("role");

    if (role && INTERACTIVE_ROLES.has(role)) {
      return true;
    }
  }

  return false;
}

export function WindowDragSurface({
  children,
  className,
  dragHeight = DEFAULT_DRAG_HEIGHT,
}: WindowDragSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!(surface instanceof HTMLElement)) {
      return;
    }

    const handlePointerDown = async (event: MouseEvent) => {
      if (event.button !== 0 || event.clientY > dragHeight) {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLElement) || !surface.contains(target)) {
        return;
      }

      if (isInteractiveElement(surface, target)) {
        return;
      }

      event.preventDefault();

      try {
        await getCurrentWindow().startDragging();
      } catch {
        // Ignore failures outside the Tauri runtime, such as in the browser.
      }
    };

    surface.addEventListener("mousedown", handlePointerDown);

    return () => {
      surface.removeEventListener("mousedown", handlePointerDown);
    };
  }, [dragHeight]);

  return (
    <div ref={surfaceRef} className={className}>
      {children}
    </div>
  );
}
