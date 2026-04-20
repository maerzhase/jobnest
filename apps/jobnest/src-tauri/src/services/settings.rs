use crate::{
    db::{AppError, Database},
    models::{
        AppSettings, AttachmentMigrationResult, AttachmentMigrationStatus, ExportBackupResult,
        ExportData, ImportBackupResult, ImportDataInput, UpdateAppSettingsInput,
    },
};

#[derive(Debug, Clone)]
pub struct SettingsService {
    db: Database,
}

impl SettingsService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub async fn get(&self) -> Result<AppSettings, AppError> {
        self.db.get_app_settings().await
    }

    pub async fn update(&self, input: UpdateAppSettingsInput) -> Result<AppSettings, AppError> {
        self.db.update_app_settings(input).await
    }

    pub async fn reset(&self) -> Result<AppSettings, AppError> {
        self.db.reset_app_data().await
    }

    pub async fn export(&self) -> Result<ExportData, AppError> {
        self.db.export_app_data().await
    }

    pub async fn import(&self, input: ImportDataInput) -> Result<ExportData, AppError> {
        self.db.import_app_data(input).await
    }

    pub async fn export_backup(&self, file_path: String) -> Result<ExportBackupResult, AppError> {
        self.db.export_backup(&file_path).await
    }

    pub async fn import_backup(&self, file_path: String) -> Result<ImportBackupResult, AppError> {
        self.db.import_backup(&file_path).await
    }

    pub async fn attachment_migration_status(&self) -> Result<AttachmentMigrationStatus, AppError> {
        self.db.get_attachment_migration_status().await
    }

    pub async fn migrate_legacy_attachments(&self) -> Result<AttachmentMigrationResult, AppError> {
        self.db.migrate_legacy_attachments().await
    }
}
