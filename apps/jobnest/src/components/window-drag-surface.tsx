"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";

type WindowDragSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  dragHeight?: number;
};

const DEFAULT_DRAG_HEIGHT = 64;
const DRAG_START_THRESHOLD = 4;

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
  const pointerDownRef = useRef<{
    target: HTMLElement;
    x: number;
    y: number;
  } | null>(null);

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

      pointerDownRef.current = {
        target,
        x: event.clientX,
        y: event.clientY,
      };
    };

    const clearPendingDrag = () => {
      pointerDownRef.current = null;
    };

    const handlePointerMove = async (event: MouseEvent) => {
      const pendingDrag = pointerDownRef.current;

      if (!pendingDrag) {
        return;
      }

      if ((event.buttons & 1) !== 1) {
        clearPendingDrag();
        return;
      }

      const movedX = Math.abs(event.clientX - pendingDrag.x);
      const movedY = Math.abs(event.clientY - pendingDrag.y);

      if (
        movedX < DRAG_START_THRESHOLD &&
        movedY < DRAG_START_THRESHOLD
      ) {
        return;
      }

      clearPendingDrag();
      event.preventDefault();

      try {
        await getCurrentWindow().startDragging();
      } catch {
        // Ignore failures outside the Tauri runtime, such as in the browser.
      }
    };

    const handleDoubleClick = async (event: MouseEvent) => {
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

      clearPendingDrag();
      event.preventDefault();

      try {
        const currentWindow = getCurrentWindow();
        const isMaximized = await currentWindow.isMaximized();

        if (isMaximized) {
          await currentWindow.unmaximize();
          return;
        }

        await currentWindow.maximize();
      } catch {
        // Ignore failures outside the Tauri runtime, such as in the browser.
      }
    };

    surface.addEventListener("mousedown", handlePointerDown);
    surface.addEventListener("mousemove", handlePointerMove);
    surface.addEventListener("mouseup", clearPendingDrag);
    surface.addEventListener("mouseleave", clearPendingDrag);
    surface.addEventListener("dblclick", handleDoubleClick);

    return () => {
      surface.removeEventListener("mousedown", handlePointerDown);
      surface.removeEventListener("mousemove", handlePointerMove);
      surface.removeEventListener("mouseup", clearPendingDrag);
      surface.removeEventListener("mouseleave", clearPendingDrag);
      surface.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [dragHeight]);

  return (
    <div ref={surfaceRef} className={className}>
      {children}
    </div>
  );
}
