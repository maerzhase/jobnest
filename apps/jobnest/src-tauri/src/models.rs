use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Company {
    pub id: String,
    pub name: String,
    pub website: Option<String>,
    pub location: Option<String>,
    pub industry: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Role {
    pub id: String,
    pub company_id: String,
    pub title: String,
    pub job_board: Option<String>,
    pub source_url: Option<String>,
    pub application_source: String,
    pub employment_type: Option<String>,
    pub location_text: Option<String>,
    pub salary_text: Option<String>,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Application {
    pub id: String,
    pub role_id: String,
    pub status: String,
    pub applied_at: Option<String>,
    pub first_response_at: Option<String>,
    pub deadline_at: Option<String>,
    pub salary_expectation: Option<String>,
    pub salary_offer: Option<String>,
    pub last_activity_at: String,
    pub priority: i64,
    pub archived_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationListItem {
    pub id: String,
    pub company_name: String,
    pub role_title: String,
    pub job_post_url: Option<String>,
    pub application_source: String,
    pub salary_expectation: Option<String>,
    pub salary_offer: Option<String>,
    pub status: String,
    pub applied_at: Option<String>,
    pub first_response_at: Option<String>,
    pub notes: Option<String>,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationStatusGroup {
    pub status: String,
    pub applications: Vec<ApplicationListItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Contact {
    pub id: String,
    pub company_id: String,
    pub name: String,
    pub title: Option<String>,
    pub email: Option<String>,
    pub linkedin_url: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub application_id: String,
    pub body: String,
    pub kind: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub entity_type: String,
    pub entity_id: String,
    pub title: String,
    pub subtitle: String,
    pub snippet: String,
    pub score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SearchFilters {
    pub entity_types: Option<Vec<String>>,
    pub only_active_applications: Option<bool>,
    pub statuses: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub preferred_currency: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateCompanyInput {
    pub name: String,
    pub website: Option<String>,
    pub location: Option<String>,
    pub industry: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateRoleInput {
    pub company_id: String,
    pub title: String,
    pub job_board: Option<String>,
    pub source_url: Option<String>,
    pub application_source: Option<String>,
    pub employment_type: Option<String>,
    pub location_text: Option<String>,
    pub salary_text: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateApplicationInput {
    pub role_id: String,
    pub status: String,
    pub applied_at: Option<String>,
    pub first_response_at: Option<String>,
    pub deadline_at: Option<String>,
    pub salary_expectation: Option<String>,
    pub salary_offer: Option<String>,
    pub priority: Option<i64>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateContactInput {
    pub company_id: String,
    pub name: String,
    pub title: Option<String>,
    pub email: Option<String>,
    pub linkedin_url: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateNoteInput {
    pub application_id: String,
    pub body: String,
    pub kind: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateApplicationStatusInput {
    pub application_id: String,
    pub status: String,
    pub source: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTrackedApplicationInput {
    pub application_id: String,
    pub job_post_url: String,
    pub company_name: String,
    pub role_title: String,
    pub application_source: String,
    pub salary_expectation: Option<String>,
    pub salary_offer: Option<String>,
    pub status: String,
    pub applied_at: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateTrackedApplicationInput {
    pub job_post_url: String,
    pub company_name: String,
    pub role_title: String,
    pub application_source: Option<String>,
    pub salary_expectation: Option<String>,
    pub salary_offer: Option<String>,
    pub status: Option<String>,
    pub applied_at: Option<String>,
    pub first_response_at: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAppSettingsInput {
    pub preferred_currency: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub application_id: String,
    pub title: String,
    pub due_at: Option<String>,
    pub completed_at: Option<String>,
    pub kind: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Attachment {
    pub id: String,
    pub application_id: String,
    pub kind: String,
    pub file_name: String,
    pub file_path: String,
    pub mime_type: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StageEvent {
    pub id: String,
    pub application_id: String,
    pub from_status: Option<String>,
    pub to_status: String,
    pub changed_at: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct ExportData {
    pub companies: Vec<Company>,
    pub roles: Vec<Role>,
    pub applications: Vec<Application>,
    pub contacts: Vec<Contact>,
    pub notes: Vec<Note>,
    pub tasks: Vec<Task>,
    pub attachments: Vec<Attachment>,
    pub stage_events: Vec<StageEvent>,
    pub app_settings: AppSettings,
    pub export_version: String,
    pub exported_at: String,
}

#[derive(Debug, Clone, Deserialize, Type)]
pub struct ImportDataInput {
    pub companies: Vec<Company>,
    pub roles: Vec<Role>,
    pub applications: Vec<Application>,
    pub contacts: Vec<Contact>,
    pub notes: Vec<Note>,
    pub tasks: Vec<Task>,
    pub attachments: Vec<Attachment>,
    pub stage_events: Vec<StageEvent>,
    pub app_settings: Option<AppSettings>,
}
