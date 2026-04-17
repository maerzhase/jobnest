---
"jobnest": patch
---

Add native in-app update support with a `Check for Updates…` menu action.

- Wire the Tauri updater plugin into the desktop shell.
- Show native dialogs for update availability, install confirmation, and restart prompts.
- Prepare release builds to publish signed updater artifacts for in-app installs.
