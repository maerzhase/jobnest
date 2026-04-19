use tauri::{AppHandle, State};

use crate::{
    db::Database,
    models::{
        AppSettings, Application, ApplicationHistoryEvent, ApplicationListItem,
        ApplicationStatusGroup, AttachmentMigrationResult, AttachmentMigrationStatus, Company,
        Contact, CreateApplicationInput, CreateCompanyInput, CreateContactInput,
        CreateNoteInput, CreateRoleInput, CreateTrackedApplicationInput, ExportBackupResult,
        ImportBackupResult, Note, Role, SearchFilters, SearchResult, UpdateAppSettingsInput,
        UpdateApplicationStatusInput, UpdateTrackedApplicationInput,
    },
    AppState, AvailableUpdate,
};

#[tauri::command]
#[specta::specta]
pub async fn create_company(
    input: CreateCompanyInput,
    state: State<'_, AppState>,
) -> Result<Company, String> {
    state
        .db
        .create_company(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_role(
    input: CreateRoleInput,
    state: State<'_, AppState>,
) -> Result<Role, String> {
    state
        .db
        .create_role(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_application(
    input: CreateApplicationInput,
    state: State<'_, AppState>,
) -> Result<Application, String> {
    state
        .db
        .create_application(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_tracked_application(
    input: CreateTrackedApplicationInput,
    state: State<'_, AppState>,
) -> Result<ApplicationListItem, String> {
    state
        .applications
        .create_tracked(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn update_application_status(
    input: UpdateApplicationStatusInput,
    state: State<'_, AppState>,
) -> Result<Application, String> {
    state
        .db
        .update_application_status(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn update_tracked_application(
    input: UpdateTrackedApplicationInput,
    state: State<'_, AppState>,
) -> Result<ApplicationListItem, String> {
    state
        .applications
        .update_tracked(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_tracked_application(
    application_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    state
        .applications
        .delete_tracked(&application_id)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_contact(
    input: CreateContactInput,
    state: State<'_, AppState>,
) -> Result<Contact, String> {
    state
        .db
        .create_contact(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_note(
    input: CreateNoteInput,
    state: State<'_, AppState>,
) -> Result<Note, String> {
    state
        .db
        .create_note(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn search(
    query: String,
    filters: Option<SearchFilters>,
    limit: Option<u32>,
    offset: Option<u32>,
    state: State<'_, AppState>,
) -> Result<Vec<SearchResult>, String> {
    state
        .db
        .search(query, filters, limit, offset)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn reindex_search(state: State<'_, AppState>) -> Result<(), String> {
    state
        .db
        .reindex_search()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn list_applications(
    state: State<'_, AppState>,
) -> Result<Vec<ApplicationStatusGroup>, String> {
    state
        .applications
        .list()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn list_application_history(
    state: State<'_, AppState>,
) -> Result<Vec<ApplicationHistoryEvent>, String> {
    state
        .applications
        .list_history()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_app_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    state.settings.get().await.map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn update_app_settings(
    input: UpdateAppSettingsInput,
    state: State<'_, AppState>,
) -> Result<AppSettings, String> {
    state
        .settings
        .update(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn reset_app_data(state: State<'_, AppState>) -> Result<AppSettings, String> {
    state.settings.reset().await.map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn export_app_data(
    state: State<'_, AppState>,
) -> Result<crate::models::ExportData, String> {
    state.settings.export().await.map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn import_app_data(
    input: crate::models::ImportDataInput,
    state: State<'_, AppState>,
) -> Result<crate::models::ExportData, String> {
    state
        .settings
        .import(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn export_backup(
    file_path: String,
    state: State<'_, AppState>,
) -> Result<ExportBackupResult, String> {
    state
        .settings
        .export_backup(file_path)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn import_backup(
    file_path: String,
    state: State<'_, AppState>,
) -> Result<ImportBackupResult, String> {
    state
        .settings
        .import_backup(file_path)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_attachment_migration_status(
    state: State<'_, AppState>,
) -> Result<AttachmentMigrationStatus, String> {
    state
        .settings
        .attachment_migration_status()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn migrate_legacy_attachments(
    state: State<'_, AppState>,
) -> Result<AttachmentMigrationResult, String> {
    state
        .settings
        .migrate_legacy_attachments()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn check_for_available_update(app: AppHandle) -> Result<Option<AvailableUpdate>, String> {
    crate::check_for_available_update_with_guard(app).await
}

#[tauri::command]
#[specta::specta]
pub async fn run_interactive_update_check(app: AppHandle) -> Result<(), String> {
    crate::run_interactive_update_check_with_guard(app).await
}

#[allow(dead_code)]
fn _assert_send_sync(_: &Database) {}
