use tauri::State;

use crate::{
    db::Database,
    models::{
        Application, ApplicationListItem, Company, Contact, CreateApplicationInput,
        CreateCompanyInput, CreateContactInput, CreateNoteInput, CreateRoleInput,
        CreateTrackedApplicationInput, Note, Role, SearchFilters, SearchResult,
        UpdateApplicationStatusInput,
    },
    AppState,
};

#[tauri::command]
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
pub async fn create_tracked_application(
    input: CreateTrackedApplicationInput,
    state: State<'_, AppState>,
) -> Result<ApplicationListItem, String> {
    state
        .db
        .create_tracked_application(input)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
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
pub async fn reindex_search(state: State<'_, AppState>) -> Result<(), String> {
    state
        .db
        .reindex_search()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn list_applications(
    state: State<'_, AppState>,
) -> Result<Vec<ApplicationListItem>, String> {
    state
        .db
        .list_applications()
        .await
        .map_err(|err| err.to_string())
}

#[allow(dead_code)]
fn _assert_send_sync(_: &Database) {}
