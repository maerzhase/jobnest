use std::{fmt::Write as _, path::Path};

use chrono::Utc;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    QueryBuilder, Row, Sqlite, SqlitePool,
};
use tauri::{AppHandle, Manager};
use thiserror::Error;
use unicode_normalization::{char::is_combining_mark, UnicodeNormalization};
use uuid::Uuid;

use crate::models::{
    AppSettings, Application, ApplicationListItem, Company, Contact, CreateApplicationInput,
    CreateCompanyInput, CreateContactInput, CreateNoteInput, CreateRoleInput,
    CreateTrackedApplicationInput, Note, Role, SearchFilters, SearchResult, UpdateAppSettingsInput,
    UpdateApplicationStatusInput, UpdateTrackedApplicationInput,
};

const ENTITY_APPLICATION: &str = "application";
const APPLICATION_STATUS_SAVED: &str = "saved";
const APPLICATION_STATUS_APPLIED: &str = "applied";
const APPLICATION_STATUS_INTERVIEW: &str = "interview";
const APPLICATION_STATUS_OFFER: &str = "offer";
const APPLICATION_STATUS_REJECTED: &str = "rejected";
const ENTITY_COMPANY: &str = "company";
const ENTITY_CONTACT: &str = "contact";
const ENTITY_NOTE: &str = "note";
const ENTITY_ROLE: &str = "role";
const DEFAULT_PREFERRED_CURRENCY: &str = "EUR";

type AppResult<T> = Result<T, AppError>;

#[derive(Debug, Clone)]
pub struct Database {
    pool: SqlitePool,
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("migration error: {0}")]
    Migration(#[from] sqlx::migrate::MigrateError),
    #[error("failed to resolve app data directory")]
    MissingAppDataDir,
    #[error("filesystem error: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid search query")]
    InvalidSearchQuery,
    #[error("invalid application status: {0}")]
    InvalidApplicationStatus(String),
}

#[derive(Debug, Clone)]
struct SearchDocument {
    id: String,
    entity_type: &'static str,
    entity_id: String,
    title: String,
    subtitle: String,
    body: String,
    keywords: String,
    updated_at: String,
}

impl Database {
    pub async fn new(app: &AppHandle) -> AppResult<Self> {
        let app_data_dir = app
            .path()
            .app_data_dir()
            .map_err(|_| AppError::MissingAppDataDir)?;
        std::fs::create_dir_all(&app_data_dir)?;

        let db_path = app_data_dir.join("jobnest.sqlite");
        Self::connect(&db_path).await
    }

    #[cfg(test)]
    pub async fn for_path(path: &Path) -> AppResult<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        Self::connect(path).await
    }

    async fn connect(path: &Path) -> AppResult<Self> {
        let options = SqliteConnectOptions::new()
            .filename(path)
            .create_if_missing(true)
            .foreign_keys(true)
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal);

        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect_with(options)
            .await?;

        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }

    pub async fn create_company(&self, input: CreateCompanyInput) -> AppResult<Company> {
        let now = now_utc();
        let company = Company {
            id: new_id(),
            name: input.name.trim().to_owned(),
            website: trim_to_option(input.website),
            location: trim_to_option(input.location),
            industry: trim_to_option(input.industry),
            created_at: now.clone(),
            updated_at: now,
        };

        sqlx::query(
            r#"
            INSERT INTO companies (id, name, website, location, industry, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&company.id)
        .bind(&company.name)
        .bind(&company.website)
        .bind(&company.location)
        .bind(&company.industry)
        .bind(&company.created_at)
        .bind(&company.updated_at)
        .execute(&self.pool)
        .await?;

        self.upsert_search_document_for_company(&company.id).await?;
        Ok(company)
    }

    pub async fn create_role(&self, input: CreateRoleInput) -> AppResult<Role> {
        let now = now_utc();
        let role = Role {
            id: new_id(),
            company_id: input.company_id,
            title: input.title.trim().to_owned(),
            job_board: trim_to_option(input.job_board),
            source_url: trim_to_option(input.source_url),
            employment_type: trim_to_option(input.employment_type),
            location_text: trim_to_option(input.location_text),
            salary_text: trim_to_option(input.salary_text),
            description: trim_to_option(input.description),
            created_at: now.clone(),
            updated_at: now,
        };

        sqlx::query(
            r#"
            INSERT INTO roles (
                id, company_id, title, job_board, source_url, employment_type,
                location_text, salary_text, description, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&role.id)
        .bind(&role.company_id)
        .bind(&role.title)
        .bind(&role.job_board)
        .bind(&role.source_url)
        .bind(&role.employment_type)
        .bind(&role.location_text)
        .bind(&role.salary_text)
        .bind(&role.description)
        .bind(&role.created_at)
        .bind(&role.updated_at)
        .execute(&self.pool)
        .await?;

        self.upsert_search_document_for_role(&role.id).await?;
        Ok(role)
    }

    pub async fn create_application(
        &self,
        input: CreateApplicationInput,
    ) -> AppResult<Application> {
        let now = now_utc();
        let status = normalize_application_status(&input.status)?;
        let application = Application {
            id: new_id(),
            role_id: input.role_id,
            status: status.clone(),
            applied_at: trim_to_option(input.applied_at)
                .or_else(|| should_set_applied_at(&status).then(|| now.clone())),
            first_response_at: trim_to_option(input.first_response_at)
                .or_else(|| should_set_first_response_at(&status).then(|| now.clone())),
            deadline_at: trim_to_option(input.deadline_at),
            salary_expectation: trim_to_option(input.salary_expectation),
            salary_offer: trim_to_option(input.salary_offer),
            last_activity_at: now.clone(),
            priority: input.priority.unwrap_or(0),
            archived_at: None,
            created_at: now.clone(),
            updated_at: now.clone(),
        };

        sqlx::query(
            r#"
            INSERT INTO applications (
                id, role_id, status, applied_at, first_response_at, deadline_at,
                salary_expectation, salary_offer, last_activity_at, priority,
                archived_at, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&application.id)
        .bind(&application.role_id)
        .bind(&application.status)
        .bind(&application.applied_at)
        .bind(&application.first_response_at)
        .bind(&application.deadline_at)
        .bind(&application.salary_expectation)
        .bind(&application.salary_offer)
        .bind(&application.last_activity_at)
        .bind(application.priority)
        .bind(&application.archived_at)
        .bind(&application.created_at)
        .bind(&application.updated_at)
        .execute(&self.pool)
        .await?;

        sqlx::query(
            r#"
            INSERT INTO stage_events (id, application_id, from_status, to_status, changed_at, source)
            VALUES (?, ?, NULL, ?, ?, 'system')
            "#,
        )
        .bind(new_id())
        .bind(&application.id)
        .bind(&application.status)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        self.upsert_search_document_for_application(&application.id)
            .await?;

        Ok(application)
    }

    pub async fn create_tracked_application(
        &self,
        input: CreateTrackedApplicationInput,
    ) -> AppResult<ApplicationListItem> {
        let company = self
            .create_company(CreateCompanyInput {
                name: input.company_name,
                website: None,
                location: None,
                industry: None,
            })
            .await?;

        let role = self
            .create_role(CreateRoleInput {
                company_id: company.id,
                title: input.role_title,
                job_board: None,
                source_url: Some(input.job_post_url),
                employment_type: None,
                location_text: None,
                salary_text: None,
                description: None,
            })
            .await?;

        let application = self
            .create_application(CreateApplicationInput {
                role_id: role.id,
                status: input
                    .status
                    .unwrap_or_else(|| APPLICATION_STATUS_SAVED.to_owned()),
                applied_at: input.applied_at,
                first_response_at: input.first_response_at,
                deadline_at: None,
                salary_expectation: input.salary_expectation,
                salary_offer: input.salary_offer,
                priority: Some(0),
            })
            .await?;

        if let Some(notes) = trim_to_option(input.notes) {
            self.create_note(CreateNoteInput {
                application_id: application.id.clone(),
                body: notes,
                kind: Some("general".to_owned()),
            })
            .await?;
        }

        self.get_application_list_item(&application.id).await
    }

    pub async fn update_application_status(
        &self,
        input: UpdateApplicationStatusInput,
    ) -> AppResult<Application> {
        let current = sqlx::query(
            "SELECT role_id, status, applied_at, first_response_at, deadline_at, salary_expectation, salary_offer, last_activity_at, priority, archived_at, created_at, updated_at FROM applications WHERE id = ?",
        )
        .bind(&input.application_id)
        .fetch_one(&self.pool)
        .await?;

        let now = now_utc();
        let next_status = normalize_application_status(&input.status)?;
        let applied_at = current
            .get::<Option<String>, _>("applied_at")
            .or_else(|| should_set_applied_at(&next_status).then(|| now.clone()));
        let first_response_at = current
            .get::<Option<String>, _>("first_response_at")
            .or_else(|| should_set_first_response_at(&next_status).then(|| now.clone()));

        sqlx::query(
            "UPDATE applications SET status = ?, applied_at = ?, first_response_at = ?, last_activity_at = ?, updated_at = ? WHERE id = ?",
        )
        .bind(&next_status)
        .bind(&applied_at)
        .bind(&first_response_at)
        .bind(&now)
        .bind(&now)
        .bind(&input.application_id)
        .execute(&self.pool)
        .await?;

        sqlx::query(
            "INSERT INTO stage_events (id, application_id, from_status, to_status, changed_at, source) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(new_id())
        .bind(&input.application_id)
        .bind(current.get::<String, _>("status"))
        .bind(&next_status)
        .bind(&now)
        .bind(input.source.unwrap_or_else(|| "user".to_owned()))
        .execute(&self.pool)
        .await?;

        self.upsert_search_document_for_application(&input.application_id)
            .await?;

        Ok(Application {
            id: input.application_id,
            role_id: current.get("role_id"),
            status: next_status,
            applied_at,
            first_response_at,
            deadline_at: current.get("deadline_at"),
            salary_expectation: current.get("salary_expectation"),
            salary_offer: current.get("salary_offer"),
            last_activity_at: now.clone(),
            priority: current.get("priority"),
            archived_at: current.get("archived_at"),
            created_at: current.get("created_at"),
            updated_at: now,
        })
    }

    pub async fn update_tracked_application(
        &self,
        input: UpdateTrackedApplicationInput,
    ) -> AppResult<ApplicationListItem> {
        let current = sqlx::query(
            r#"
            SELECT
                a.id AS application_id,
                a.role_id,
                a.status,
                a.applied_at,
                a.first_response_at,
                a.deadline_at,
                a.salary_expectation,
                a.salary_offer,
                a.last_activity_at,
                a.priority,
                a.archived_at,
                a.created_at,
                a.updated_at,
                r.id AS role_id_full,
                r.company_id,
                c.id AS company_id_full
            FROM applications a
            INNER JOIN roles r ON r.id = a.role_id
            INNER JOIN companies c ON c.id = r.company_id
            WHERE a.id = ?
            "#,
        )
        .bind(&input.application_id)
        .fetch_one(&self.pool)
        .await?;

        let now = now_utc();
        let next_status = normalize_application_status(&input.status)?;
        let applied_at = current
            .get::<Option<String>, _>("applied_at")
            .or_else(|| should_set_applied_at(&next_status).then(|| now.clone()));
        let first_response_at = current
            .get::<Option<String>, _>("first_response_at")
            .or_else(|| should_set_first_response_at(&next_status).then(|| now.clone()));

        sqlx::query("UPDATE companies SET name = ?, updated_at = ? WHERE id = ?")
            .bind(input.company_name.trim())
            .bind(&now)
            .bind(current.get::<String, _>("company_id"))
            .execute(&self.pool)
            .await?;

        sqlx::query("UPDATE roles SET title = ?, source_url = ?, updated_at = ? WHERE id = ?")
            .bind(input.role_title.trim())
            .bind(trim_to_option(Some(input.job_post_url)))
            .bind(&now)
            .bind(current.get::<String, _>("role_id"))
            .execute(&self.pool)
            .await?;

        sqlx::query(
            r#"
            UPDATE applications
            SET status = ?, applied_at = ?, first_response_at = ?, salary_expectation = ?, salary_offer = ?, last_activity_at = ?, updated_at = ?
            WHERE id = ?
            "#,
        )
        .bind(&next_status)
        .bind(&applied_at)
        .bind(&first_response_at)
        .bind(trim_to_option(input.salary_expectation))
        .bind(trim_to_option(input.salary_offer))
        .bind(&now)
        .bind(&now)
        .bind(&input.application_id)
        .execute(&self.pool)
        .await?;

        let previous_status: String = current.get("status");
        if previous_status != next_status {
            sqlx::query(
                "INSERT INTO stage_events (id, application_id, from_status, to_status, changed_at, source) VALUES (?, ?, ?, ?, ?, ?)",
            )
            .bind(new_id())
            .bind(&input.application_id)
            .bind(previous_status)
            .bind(&next_status)
            .bind(&now)
            .bind("user")
            .execute(&self.pool)
            .await?;
        }

        let existing_note_id = sqlx::query_scalar::<_, String>(
            r#"
            SELECT id
            FROM notes
            WHERE application_id = ?
            ORDER BY updated_at DESC, created_at DESC
            LIMIT 1
            "#,
        )
        .bind(&input.application_id)
        .fetch_optional(&self.pool)
        .await?;

        match (existing_note_id, trim_to_option(input.notes)) {
            (Some(note_id), Some(body)) => {
                sqlx::query("UPDATE notes SET body = ?, updated_at = ? WHERE id = ?")
                    .bind(body)
                    .bind(&now)
                    .bind(&note_id)
                    .execute(&self.pool)
                    .await?;
                self.upsert_search_document_for_note(&note_id).await?;
            }
            (Some(note_id), None) => {
                self.delete_search_document(ENTITY_NOTE, &note_id).await?;
                sqlx::query("DELETE FROM notes WHERE id = ?")
                    .bind(&note_id)
                    .execute(&self.pool)
                    .await?;
            }
            (None, Some(body)) => {
                self.create_note(CreateNoteInput {
                    application_id: input.application_id.clone(),
                    body,
                    kind: Some("general".to_owned()),
                })
                .await?;
            }
            (None, None) => {}
        }

        let company_id: String = current.get("company_id");
        let role_id: String = current.get("role_id");
        self.upsert_search_document_for_company(&company_id).await?;
        self.upsert_search_document_for_role(&role_id).await?;
        self.upsert_search_document_for_application(&input.application_id)
            .await?;
        self.get_application_list_item(&input.application_id).await
    }

    pub async fn delete_tracked_application(&self, application_id: &str) -> AppResult<()> {
        let current = sqlx::query(
            r#"
            SELECT
                a.role_id,
                r.company_id
            FROM applications a
            INNER JOIN roles r ON r.id = a.role_id
            WHERE a.id = ?
            "#,
        )
        .bind(application_id)
        .fetch_one(&self.pool)
        .await?;

        let role_id: String = current.get("role_id");
        let company_id: String = current.get("company_id");

        let note_ids = sqlx::query_scalar::<_, String>("SELECT id FROM notes WHERE application_id = ?")
            .bind(application_id)
            .fetch_all(&self.pool)
            .await?;

        for note_id in &note_ids {
            self.delete_search_document(ENTITY_NOTE, note_id).await?;
        }

        self.delete_search_document(ENTITY_APPLICATION, application_id)
            .await?;

        sqlx::query("DELETE FROM applications WHERE id = ?")
            .bind(application_id)
            .execute(&self.pool)
            .await?;

        let role_application_count =
            sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM applications WHERE role_id = ?")
                .bind(&role_id)
                .fetch_one(&self.pool)
                .await?;

        if role_application_count == 0 {
            self.delete_search_document(ENTITY_ROLE, &role_id).await?;
            sqlx::query("DELETE FROM roles WHERE id = ?")
                .bind(&role_id)
                .execute(&self.pool)
                .await?;
        } else {
            self.upsert_search_document_for_role(&role_id).await?;
        }

        let company_role_count =
            sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM roles WHERE company_id = ?")
                .bind(&company_id)
                .fetch_one(&self.pool)
                .await?;

        if company_role_count == 0 {
            self.delete_search_document(ENTITY_COMPANY, &company_id).await?;
            sqlx::query("DELETE FROM companies WHERE id = ?")
                .bind(&company_id)
                .execute(&self.pool)
                .await?;
        } else {
            self.upsert_search_document_for_company(&company_id).await?;
        }

        Ok(())
    }

    pub async fn create_contact(&self, input: CreateContactInput) -> AppResult<Contact> {
        let now = now_utc();
        let contact = Contact {
            id: new_id(),
            company_id: input.company_id,
            name: input.name.trim().to_owned(),
            title: trim_to_option(input.title),
            email: trim_to_option(input.email),
            linkedin_url: trim_to_option(input.linkedin_url),
            notes: trim_to_option(input.notes),
            created_at: now.clone(),
            updated_at: now,
        };

        sqlx::query(
            r#"
            INSERT INTO contacts (id, company_id, name, title, email, linkedin_url, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&contact.id)
        .bind(&contact.company_id)
        .bind(&contact.name)
        .bind(&contact.title)
        .bind(&contact.email)
        .bind(&contact.linkedin_url)
        .bind(&contact.notes)
        .bind(&contact.created_at)
        .bind(&contact.updated_at)
        .execute(&self.pool)
        .await?;

        self.upsert_search_document_for_contact(&contact.id).await?;
        Ok(contact)
    }

    pub async fn create_note(&self, input: CreateNoteInput) -> AppResult<Note> {
        let now = now_utc();
        let note = Note {
            id: new_id(),
            application_id: input.application_id,
            body: input.body.trim().to_owned(),
            kind: trim_to_option(input.kind).unwrap_or_else(|| "general".to_owned()),
            created_at: now.clone(),
            updated_at: now,
        };

        sqlx::query(
            "INSERT INTO notes (id, application_id, body, kind, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(&note.id)
        .bind(&note.application_id)
        .bind(&note.body)
        .bind(&note.kind)
        .bind(&note.created_at)
        .bind(&note.updated_at)
        .execute(&self.pool)
        .await?;

        self.upsert_search_document_for_note(&note.id).await?;
        self.upsert_search_document_for_application(&note.application_id)
            .await?;

        Ok(note)
    }

    pub async fn search(
        &self,
        query: String,
        filters: Option<SearchFilters>,
        limit: Option<u32>,
        offset: Option<u32>,
    ) -> AppResult<Vec<SearchResult>> {
        let normalized_query = build_fts_query(&query)?;
        let filters = filters.unwrap_or(SearchFilters {
            entity_types: None,
            only_active_applications: None,
            statuses: None,
        });

        let mut builder = QueryBuilder::<Sqlite>::new(
            r#"
            SELECT
                si.entity_type,
                si.entity_id,
                si.title,
                si.subtitle,
                snippet(search_index, 5, '<mark>', '</mark>', '…', 12) AS snippet,
                bm25(search_index, 10.0, 6.0, 2.0, 4.0) AS score
            FROM search_index si
            LEFT JOIN applications application_filter
                ON si.entity_type = 'application' AND si.entity_id = application_filter.id
            WHERE search_index MATCH
            "#,
        );

        builder.push_bind(normalized_query);

        if let Some(entity_types) = filters.entity_types.filter(|items| !items.is_empty()) {
            builder.push(" AND si.entity_type IN (");
            let mut separated = builder.separated(", ");
            for entity_type in entity_types {
                separated.push_bind(entity_type);
            }
            separated.push_unseparated(")");
        }

        if filters.only_active_applications.unwrap_or(false) {
            builder.push(
                " AND (si.entity_type != 'application' OR application_filter.archived_at IS NULL)",
            );
        }

        if let Some(statuses) = filters.statuses.filter(|items| !items.is_empty()) {
            builder.push(" AND (si.entity_type != 'application' OR application_filter.status IN (");
            let mut separated = builder.separated(", ");
            for status in statuses {
                separated.push_bind(status);
            }
            separated.push_unseparated("))");
        }

        let limit = i64::from(limit.unwrap_or(20).min(100));
        let offset = i64::from(offset.unwrap_or(0));

        builder.push(" ORDER BY score ASC, si.title ASC LIMIT ");
        builder.push_bind(limit);
        builder.push(" OFFSET ");
        builder.push_bind(offset);

        let rows = builder.build().fetch_all(&self.pool).await?;

        Ok(rows
            .into_iter()
            .map(|row| SearchResult {
                entity_type: row.get("entity_type"),
                entity_id: row.get("entity_id"),
                title: row.get("title"),
                subtitle: row.get("subtitle"),
                snippet: row.get("snippet"),
                score: row.get("score"),
            })
            .collect())
    }

    pub async fn reindex_search(&self) -> AppResult<()> {
        sqlx::query("DELETE FROM search_documents")
            .execute(&self.pool)
            .await?;
        sqlx::query("DELETE FROM search_index")
            .execute(&self.pool)
            .await?;

        let company_ids = sqlx::query_scalar::<_, String>("SELECT id FROM companies ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        for company_id in company_ids {
            self.upsert_search_document_for_company(&company_id).await?;
        }

        let role_ids = sqlx::query_scalar::<_, String>("SELECT id FROM roles ORDER BY title")
            .fetch_all(&self.pool)
            .await?;
        for role_id in role_ids {
            self.upsert_search_document_for_role(&role_id).await?;
        }

        let application_ids =
            sqlx::query_scalar::<_, String>("SELECT id FROM applications ORDER BY created_at")
                .fetch_all(&self.pool)
                .await?;
        for application_id in application_ids {
            self.upsert_search_document_for_application(&application_id)
                .await?;
        }

        let contact_ids = sqlx::query_scalar::<_, String>("SELECT id FROM contacts ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        for contact_id in contact_ids {
            self.upsert_search_document_for_contact(&contact_id).await?;
        }

        let note_ids = sqlx::query_scalar::<_, String>("SELECT id FROM notes ORDER BY created_at")
            .fetch_all(&self.pool)
            .await?;
        for note_id in note_ids {
            self.upsert_search_document_for_note(&note_id).await?;
        }

        Ok(())
    }

    pub async fn list_applications(&self) -> AppResult<Vec<ApplicationListItem>> {
        let rows = sqlx::query(
            r#"
            SELECT
                a.id,
                c.name AS company_name,
                r.title AS role_title,
                r.source_url AS job_post_url,
                a.salary_expectation,
                a.salary_offer,
                a.status,
                a.applied_at,
                a.first_response_at,
                (
                    SELECT n.body
                    FROM notes n
                    WHERE n.application_id = a.id
                    ORDER BY n.updated_at DESC, n.created_at DESC
                    LIMIT 1
                ) AS notes,
                a.updated_at,
                a.archived_at
            FROM applications a
            INNER JOIN roles r ON r.id = a.role_id
            INNER JOIN companies c ON c.id = r.company_id
            ORDER BY a.updated_at DESC, a.created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|row| ApplicationListItem {
                id: row.get("id"),
                company_name: row.get("company_name"),
                role_title: row.get("role_title"),
                job_post_url: row.get("job_post_url"),
                salary_expectation: row.get("salary_expectation"),
                salary_offer: row.get("salary_offer"),
                status: row.get("status"),
                applied_at: row.get("applied_at"),
                first_response_at: row.get("first_response_at"),
                notes: row.get("notes"),
                updated_at: row.get("updated_at"),
                archived_at: row.get("archived_at"),
            })
            .collect())
    }

    pub async fn get_app_settings(&self) -> AppResult<AppSettings> {
        let row =
            sqlx::query("SELECT preferred_currency, updated_at FROM app_settings WHERE id = 1")
                .fetch_one(&self.pool)
                .await?;

        Ok(AppSettings {
            preferred_currency: row.get("preferred_currency"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn update_app_settings(
        &self,
        input: UpdateAppSettingsInput,
    ) -> AppResult<AppSettings> {
        let now = now_utc();
        let preferred_currency = normalize_currency_code(&input.preferred_currency);

        sqlx::query(
            r#"
            INSERT INTO app_settings (id, preferred_currency, updated_at)
            VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                preferred_currency = excluded.preferred_currency,
                updated_at = excluded.updated_at
            "#,
        )
        .bind(&preferred_currency)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        Ok(AppSettings {
            preferred_currency,
            updated_at: now,
        })
    }

    pub async fn reset_app_data(&self) -> AppResult<AppSettings> {
        let now = now_utc();
        let mut transaction = self.pool.begin().await?;

        for statement in [
            "DELETE FROM application_contacts",
            "DELETE FROM attachments",
            "DELETE FROM tasks",
            "DELETE FROM stage_events",
            "DELETE FROM notes",
            "DELETE FROM contacts",
            "DELETE FROM applications",
            "DELETE FROM roles",
            "DELETE FROM companies",
            "DELETE FROM search_documents",
            "DELETE FROM search_index",
            "DELETE FROM app_settings",
        ] {
            sqlx::query(statement).execute(&mut *transaction).await?;
        }

        sqlx::query(
            "INSERT INTO app_settings (id, preferred_currency, updated_at) VALUES (1, ?, ?)",
        )
        .bind(DEFAULT_PREFERRED_CURRENCY)
        .bind(&now)
        .execute(&mut *transaction)
        .await?;

        transaction.commit().await?;

        Ok(AppSettings {
            preferred_currency: DEFAULT_PREFERRED_CURRENCY.to_owned(),
            updated_at: now,
        })
    }

    async fn upsert_search_document_for_company(&self, company_id: &str) -> AppResult<()> {
        let row = sqlx::query(
            "SELECT name, website, location, industry, updated_at FROM companies WHERE id = ?",
        )
        .bind(company_id)
        .fetch_one(&self.pool)
        .await?;

        let document = SearchDocument {
            id: new_id(),
            entity_type: ENTITY_COMPANY,
            entity_id: company_id.to_owned(),
            title: row.get("name"),
            subtitle: row.get::<Option<String>, _>("location").unwrap_or_default(),
            body: join_parts([
                row.get::<Option<String>, _>("website"),
                row.get::<Option<String>, _>("industry"),
            ]),
            keywords: join_parts([
                Some("company".to_owned()),
                row.get::<Option<String>, _>("industry"),
                row.get::<Option<String>, _>("location"),
            ]),
            updated_at: row.get("updated_at"),
        };

        self.persist_search_document(document).await
    }

    async fn upsert_search_document_for_role(&self, role_id: &str) -> AppResult<()> {
        let row = sqlx::query(
            r#"
            SELECT
                r.title,
                r.job_board,
                r.source_url,
                r.employment_type,
                r.location_text,
                r.salary_text,
                r.description,
                r.updated_at,
                c.name AS company_name
            FROM roles r
            INNER JOIN companies c ON c.id = r.company_id
            WHERE r.id = ?
            "#,
        )
        .bind(role_id)
        .fetch_one(&self.pool)
        .await?;

        let company_name: String = row.get("company_name");
        let document = SearchDocument {
            id: new_id(),
            entity_type: ENTITY_ROLE,
            entity_id: role_id.to_owned(),
            title: row.get("title"),
            subtitle: company_name.clone(),
            body: join_parts([
                row.get::<Option<String>, _>("location_text"),
                row.get::<Option<String>, _>("employment_type"),
                row.get::<Option<String>, _>("salary_text"),
                row.get::<Option<String>, _>("description"),
                row.get::<Option<String>, _>("source_url"),
            ]),
            keywords: join_parts([
                Some(company_name),
                row.get::<Option<String>, _>("job_board"),
                row.get::<Option<String>, _>("employment_type"),
            ]),
            updated_at: row.get("updated_at"),
        };

        self.persist_search_document(document).await
    }

    async fn upsert_search_document_for_application(&self, application_id: &str) -> AppResult<()> {
        let row = sqlx::query(
            r#"
            SELECT
                a.status,
                a.priority,
                a.applied_at,
                a.first_response_at,
                a.deadline_at,
                a.salary_expectation,
                a.salary_offer,
                a.updated_at,
                r.title AS role_title,
                r.source_url,
                c.name AS company_name
            FROM applications a
            INNER JOIN roles r ON r.id = a.role_id
            INNER JOIN companies c ON c.id = r.company_id
            WHERE a.id = ?
            "#,
        )
        .bind(application_id)
        .fetch_one(&self.pool)
        .await?;

        let notes_summary = sqlx::query_scalar::<_, Option<String>>(
            "SELECT group_concat(body, ' ') FROM notes WHERE application_id = ?",
        )
        .bind(application_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or_default();

        let role_title: String = row.get("role_title");
        let company_name: String = row.get("company_name");
        let status: String = row.get("status");
        let document = SearchDocument {
            id: new_id(),
            entity_type: ENTITY_APPLICATION,
            entity_id: application_id.to_owned(),
            title: format!("{role_title} at {company_name}"),
            subtitle: format!("Status: {status}"),
            body: join_parts([
                row.get::<Option<String>, _>("source_url"),
                row.get::<Option<String>, _>("applied_at"),
                row.get::<Option<String>, _>("first_response_at"),
                row.get::<Option<String>, _>("deadline_at"),
                row.get::<Option<String>, _>("salary_expectation"),
                row.get::<Option<String>, _>("salary_offer"),
                Some(format!("Priority {}", row.get::<i64, _>("priority"))),
                Some(notes_summary),
            ]),
            keywords: join_parts([Some(role_title), Some(company_name), Some(status)]),
            updated_at: row.get("updated_at"),
        };

        self.persist_search_document(document).await
    }

    async fn upsert_search_document_for_contact(&self, contact_id: &str) -> AppResult<()> {
        let row = sqlx::query(
            r#"
            SELECT
                contact.name,
                contact.title,
                contact.email,
                contact.linkedin_url,
                contact.notes,
                contact.updated_at,
                company.name AS company_name
            FROM contacts contact
            INNER JOIN companies company ON company.id = contact.company_id
            WHERE contact.id = ?
            "#,
        )
        .bind(contact_id)
        .fetch_one(&self.pool)
        .await?;

        let company_name: String = row.get("company_name");
        let title = row
            .get::<Option<String>, _>("title")
            .unwrap_or_else(|| "Contact".to_owned());

        let document = SearchDocument {
            id: new_id(),
            entity_type: ENTITY_CONTACT,
            entity_id: contact_id.to_owned(),
            title: row.get("name"),
            subtitle: format!("{title} at {company_name}"),
            body: join_parts([
                row.get::<Option<String>, _>("email"),
                row.get::<Option<String>, _>("linkedin_url"),
                row.get::<Option<String>, _>("notes"),
            ]),
            keywords: join_parts([Some(company_name), Some("contact".to_owned())]),
            updated_at: row.get("updated_at"),
        };

        self.persist_search_document(document).await
    }

    async fn upsert_search_document_for_note(&self, note_id: &str) -> AppResult<()> {
        let row = sqlx::query(
            r#"
            SELECT
                n.application_id,
                n.body,
                n.kind,
                n.updated_at,
                r.title AS role_title,
                c.name AS company_name,
                a.status AS application_status
            FROM notes n
            INNER JOIN applications a ON a.id = n.application_id
            INNER JOIN roles r ON r.id = a.role_id
            INNER JOIN companies c ON c.id = r.company_id
            WHERE n.id = ?
            "#,
        )
        .bind(note_id)
        .fetch_one(&self.pool)
        .await?;

        let role_title: String = row.get("role_title");
        let company_name: String = row.get("company_name");
        let kind: String = row.get("kind");
        let document = SearchDocument {
            id: new_id(),
            entity_type: ENTITY_NOTE,
            entity_id: note_id.to_owned(),
            title: format!("Note for {role_title} at {company_name}"),
            subtitle: kind.clone(),
            body: row.get("body"),
            keywords: join_parts([
                Some(kind),
                Some(role_title),
                Some(company_name),
                row.get::<Option<String>, _>("application_status"),
            ]),
            updated_at: row.get("updated_at"),
        };

        self.persist_search_document(document).await
    }

    async fn persist_search_document(&self, document: SearchDocument) -> AppResult<()> {
        let existing_id = sqlx::query_scalar::<_, String>(
            "SELECT id FROM search_documents WHERE entity_type = ? AND entity_id = ?",
        )
        .bind(document.entity_type)
        .bind(&document.entity_id)
        .fetch_optional(&self.pool)
        .await?;

        let document_id = existing_id.unwrap_or(document.id);

        sqlx::query(
            r#"
            INSERT INTO search_documents (id, entity_type, entity_id, title, subtitle, body, keywords, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(entity_type, entity_id) DO UPDATE SET
                title = excluded.title,
                subtitle = excluded.subtitle,
                body = excluded.body,
                keywords = excluded.keywords,
                updated_at = excluded.updated_at
            "#,
        )
        .bind(&document_id)
        .bind(document.entity_type)
        .bind(&document.entity_id)
        .bind(&document.title)
        .bind(&document.subtitle)
        .bind(&document.body)
        .bind(&document.keywords)
        .bind(&document.updated_at)
        .execute(&self.pool)
        .await?;

        sqlx::query("DELETE FROM search_index WHERE doc_id = ?")
            .bind(&document_id)
            .execute(&self.pool)
            .await?;

        sqlx::query(
            "INSERT INTO search_index (doc_id, entity_type, entity_id, title, subtitle, body, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(&document_id)
        .bind(document.entity_type)
        .bind(&document.entity_id)
        .bind(&document.title)
        .bind(&document.subtitle)
        .bind(&document.body)
        .bind(&document.keywords)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn delete_search_document(&self, entity_type: &'static str, entity_id: &str) -> AppResult<()> {
        let document_id = sqlx::query_scalar::<_, String>(
            "SELECT id FROM search_documents WHERE entity_type = ? AND entity_id = ?",
        )
        .bind(entity_type)
        .bind(entity_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(document_id) = document_id {
            sqlx::query("DELETE FROM search_index WHERE doc_id = ?")
                .bind(&document_id)
                .execute(&self.pool)
                .await?;
        }

        sqlx::query("DELETE FROM search_documents WHERE entity_type = ? AND entity_id = ?")
            .bind(entity_type)
            .bind(entity_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn get_application_list_item(
        &self,
        application_id: &str,
    ) -> AppResult<ApplicationListItem> {
        let row = sqlx::query(
            r#"
            SELECT
                a.id,
                c.name AS company_name,
                r.title AS role_title,
                r.source_url AS job_post_url,
                a.salary_expectation,
                a.salary_offer,
                a.status,
                a.applied_at,
                a.first_response_at,
                (
                    SELECT n.body
                    FROM notes n
                    WHERE n.application_id = a.id
                    ORDER BY n.updated_at DESC, n.created_at DESC
                    LIMIT 1
                ) AS notes,
                a.updated_at,
                a.archived_at
            FROM applications a
            INNER JOIN roles r ON r.id = a.role_id
            INNER JOIN companies c ON c.id = r.company_id
            WHERE a.id = ?
            "#,
        )
        .bind(application_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(ApplicationListItem {
            id: row.get("id"),
            company_name: row.get("company_name"),
            role_title: row.get("role_title"),
            job_post_url: row.get("job_post_url"),
            salary_expectation: row.get("salary_expectation"),
            salary_offer: row.get("salary_offer"),
            status: row.get("status"),
            applied_at: row.get("applied_at"),
            first_response_at: row.get("first_response_at"),
            notes: row.get("notes"),
            updated_at: row.get("updated_at"),
            archived_at: row.get("archived_at"),
        })
    }
}

fn now_utc() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

fn trim_to_option(value: Option<String>) -> Option<String> {
    value.and_then(|value| {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_owned())
        }
    })
}

fn normalize_currency_code(value: &str) -> String {
    let trimmed = value.trim();

    if trimmed.is_empty() {
        return DEFAULT_PREFERRED_CURRENCY.to_owned();
    }

    trimmed.to_ascii_uppercase()
}

fn normalize_application_status(input: &str) -> AppResult<String> {
    let normalized = input.trim().to_ascii_lowercase();

    match normalized.as_str() {
        APPLICATION_STATUS_SAVED
        | APPLICATION_STATUS_APPLIED
        | APPLICATION_STATUS_INTERVIEW
        | APPLICATION_STATUS_OFFER
        | APPLICATION_STATUS_REJECTED => Ok(normalized),
        _ => Err(AppError::InvalidApplicationStatus(input.trim().to_owned())),
    }
}

fn should_set_applied_at(status: &str) -> bool {
    matches!(status, APPLICATION_STATUS_APPLIED)
}

fn should_set_first_response_at(status: &str) -> bool {
    matches!(
        status,
        APPLICATION_STATUS_INTERVIEW | APPLICATION_STATUS_OFFER | APPLICATION_STATUS_REJECTED
    )
}

fn join_parts<const N: usize>(parts: [Option<String>; N]) -> String {
    parts
        .into_iter()
        .flatten()
        .map(|part| part.trim().to_owned())
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

fn normalize_for_search(input: &str) -> String {
    input
        .nfkd()
        .filter(|ch| !is_combining_mark(*ch))
        .flat_map(char::to_lowercase)
        .collect::<String>()
}

fn build_fts_query(input: &str) -> AppResult<String> {
    let normalized = normalize_for_search(input);
    let tokens = normalized
        .split(|ch: char| !ch.is_alphanumeric())
        .filter(|token| !token.is_empty())
        .collect::<Vec<_>>();

    if tokens.is_empty() {
        return Err(AppError::InvalidSearchQuery);
    }

    let mut query = String::new();
    for (index, token) in tokens.iter().enumerate() {
        if index > 0 {
            query.push_str(" AND ");
        }
        let _ = write!(query, "{token}*");
    }

    Ok(query)
}

#[cfg(test)]
mod tests {
    use tempfile::tempdir;

    use super::*;

    #[tokio::test]
    async fn creates_schema_and_searches_accented_text() {
        let temp_dir = tempdir().expect("temp dir");
        let db = Database::for_path(&temp_dir.path().join("jobnest.sqlite"))
            .await
            .expect("db");

        let company = db
            .create_company(CreateCompanyInput {
                name: "José Labs".to_owned(),
                website: Some("https://jose.example".to_owned()),
                location: Some("Lisbon".to_owned()),
                industry: Some("Software".to_owned()),
            })
            .await
            .expect("company");

        let role = db
            .create_role(CreateRoleInput {
                company_id: company.id.clone(),
                title: "Frontend Engineer".to_owned(),
                job_board: Some("LinkedIn".to_owned()),
                source_url: None,
                employment_type: Some("Full-time".to_owned()),
                location_text: Some("Remote".to_owned()),
                salary_text: None,
                description: Some("Build polished product UX".to_owned()),
            })
            .await
            .expect("role");

        let application = db
            .create_application(CreateApplicationInput {
                role_id: role.id,
                status: "applied".to_owned(),
                applied_at: Some("2026-04-13T09:00:00Z".to_owned()),
                first_response_at: None,
                deadline_at: None,
                salary_expectation: None,
                salary_offer: None,
                priority: Some(2),
            })
            .await
            .expect("application");

        db.create_note(CreateNoteInput {
            application_id: application.id,
            body: "Strong portfolio and recruiter follow-up.".to_owned(),
            kind: Some("interview".to_owned()),
        })
        .await
        .expect("note");

        let results = db
            .search("jose".to_owned(), None, Some(10), Some(0))
            .await
            .expect("search");

        assert!(!results.is_empty());
        assert_eq!(results[0].entity_type, ENTITY_COMPANY);

        let prefix_results = db
            .search("front".to_owned(), None, Some(10), Some(0))
            .await
            .expect("prefix search");

        assert!(prefix_results
            .iter()
            .any(|result| result.entity_type == ENTITY_ROLE));
    }

    #[tokio::test]
    async fn rebuilds_search_index() {
        let temp_dir = tempdir().expect("temp dir");
        let db = Database::for_path(&temp_dir.path().join("jobnest.sqlite"))
            .await
            .expect("db");

        let company = db
            .create_company(CreateCompanyInput {
                name: "Northwind".to_owned(),
                website: None,
                location: Some("Porto".to_owned()),
                industry: None,
            })
            .await
            .expect("company");

        sqlx::query("DELETE FROM search_documents")
            .execute(&db.pool)
            .await
            .expect("clear docs");
        sqlx::query("DELETE FROM search_index")
            .execute(&db.pool)
            .await
            .expect("clear fts");

        let before = db
            .search("north".to_owned(), None, Some(10), Some(0))
            .await
            .expect("search before");
        assert!(before.is_empty());

        db.reindex_search().await.expect("reindex");

        let after = db
            .search("north".to_owned(), None, Some(10), Some(0))
            .await
            .expect("search after");

        assert_eq!(after.len(), 1);
        assert_eq!(after[0].entity_id, company.id);
    }

    #[tokio::test]
    async fn tracked_application_stores_mvp_fields_and_status_timestamps() {
        let temp_dir = tempdir().expect("temp dir");
        let db = Database::for_path(&temp_dir.path().join("jobnest.sqlite"))
            .await
            .expect("db");

        let saved = db
            .create_tracked_application(CreateTrackedApplicationInput {
                job_post_url: "https://jobs.example.com/product-designer".to_owned(),
                company_name: "Acme".to_owned(),
                role_title: "Product Designer".to_owned(),
                salary_expectation: Some("EUR 60k".to_owned()),
                salary_offer: None,
                status: Some(APPLICATION_STATUS_SAVED.to_owned()),
                applied_at: None,
                first_response_at: None,
                notes: Some("Strong portfolio match.".to_owned()),
            })
            .await
            .expect("saved application");

        assert_eq!(saved.status, APPLICATION_STATUS_SAVED);
        assert!(saved.applied_at.is_none());
        assert!(saved.first_response_at.is_none());
        assert_eq!(
            saved.job_post_url.as_deref(),
            Some("https://jobs.example.com/product-designer")
        );
        assert_eq!(saved.salary_expectation.as_deref(), Some("EUR 60k"));
        assert_eq!(saved.notes.as_deref(), Some("Strong portfolio match."));

        let applied = db
            .update_application_status(UpdateApplicationStatusInput {
                application_id: saved.id.clone(),
                status: APPLICATION_STATUS_APPLIED.to_owned(),
                source: Some("user".to_owned()),
            })
            .await
            .expect("applied application");

        assert_eq!(applied.status, APPLICATION_STATUS_APPLIED);
        assert!(applied.applied_at.is_some());
        assert!(applied.first_response_at.is_none());

        let updated = db
            .update_application_status(UpdateApplicationStatusInput {
                application_id: saved.id.clone(),
                status: APPLICATION_STATUS_INTERVIEW.to_owned(),
                source: Some("user".to_owned()),
            })
            .await
            .expect("updated application");

        assert_eq!(updated.status, APPLICATION_STATUS_INTERVIEW);
        assert!(updated.applied_at.is_some());
        assert!(updated.first_response_at.is_some());

        let stage_events = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM stage_events WHERE application_id = ?",
        )
        .bind(&saved.id)
        .fetch_one(&db.pool)
        .await
        .expect("stage events");

        assert_eq!(stage_events, 3);
    }

    #[tokio::test]
    async fn tracked_application_can_be_updated_and_deleted() {
        let temp_dir = tempdir().expect("temp dir");
        let db = Database::for_path(&temp_dir.path().join("jobnest.sqlite"))
            .await
            .expect("db");

        let saved = db
            .create_tracked_application(CreateTrackedApplicationInput {
                job_post_url: "https://jobs.example.com/designer".to_owned(),
                company_name: "Acme".to_owned(),
                role_title: "Designer".to_owned(),
                salary_expectation: Some("EUR 60k".to_owned()),
                salary_offer: None,
                status: Some(APPLICATION_STATUS_SAVED.to_owned()),
                applied_at: None,
                first_response_at: None,
                notes: Some("Initial note".to_owned()),
            })
            .await
            .expect("saved application");

        let updated = db
            .update_tracked_application(UpdateTrackedApplicationInput {
                application_id: saved.id.clone(),
                job_post_url: "https://jobs.example.com/senior-designer".to_owned(),
                company_name: "Acme Labs".to_owned(),
                role_title: "Senior Designer".to_owned(),
                salary_expectation: Some("USD 80k".to_owned()),
                salary_offer: Some("USD 90k".to_owned()),
                status: APPLICATION_STATUS_INTERVIEW.to_owned(),
                notes: Some("Updated note".to_owned()),
            })
            .await
            .expect("updated application");

        assert_eq!(updated.company_name, "Acme Labs");
        assert_eq!(updated.role_title, "Senior Designer");
        assert_eq!(
            updated.job_post_url.as_deref(),
            Some("https://jobs.example.com/senior-designer")
        );
        assert_eq!(updated.salary_expectation.as_deref(), Some("USD 80k"));
        assert_eq!(updated.salary_offer.as_deref(), Some("USD 90k"));
        assert_eq!(updated.status, APPLICATION_STATUS_INTERVIEW);
        assert_eq!(updated.notes.as_deref(), Some("Updated note"));

        db.delete_tracked_application(&saved.id)
            .await
            .expect("delete application");

        let applications = db.list_applications().await.expect("list applications");
        assert!(applications.is_empty());

        let company_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM companies")
            .fetch_one(&db.pool)
            .await
            .expect("company count");
        let role_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM roles")
            .fetch_one(&db.pool)
            .await
            .expect("role count");
        let app_doc_count = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM search_documents WHERE entity_type = ?",
        )
        .bind(ENTITY_APPLICATION)
        .fetch_one(&db.pool)
        .await
        .expect("app doc count");

        assert_eq!(company_count, 0);
        assert_eq!(role_count, 0);
        assert_eq!(app_doc_count, 0);
    }
}
