---
"jobnest": patch
---

Add comprehensive export/import functionality for app data backup and restore.

Features:

- Backend: `export_app_data()` and `import_app_data()` database methods with atomic transactions
- Tests: 4 integration tests for export/import operations (all passing)
- UI: Export/Import buttons in Settings > Data section with native Tauri save dialog
- CI/CD: GitHub Actions workflow now runs tests on every push
- UX: Disabled autocorrect on job post URL input field

Technical improvements:

- Added missing model types: Task, Attachment, StageEvent
- Created ExportData and ImportDataInput DTOs with version tracking
- Proper Tauri v2 permissions and capabilities setup for file operations
- Complete error handling and user feedback for all operations
