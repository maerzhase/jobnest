use crate::{
    db::{AppError, Database},
    models::{ApplicationListItem, CreateTrackedApplicationInput, UpdateTrackedApplicationInput},
};

#[derive(Debug, Clone)]
pub struct ApplicationsService {
    db: Database,
}

impl ApplicationsService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub async fn list(&self) -> Result<Vec<ApplicationListItem>, AppError> {
        self.db.list_applications().await
    }

    pub async fn create_tracked(
        &self,
        input: CreateTrackedApplicationInput,
    ) -> Result<ApplicationListItem, AppError> {
        self.db.create_tracked_application(input).await
    }

    pub async fn update_tracked(
        &self,
        input: UpdateTrackedApplicationInput,
    ) -> Result<ApplicationListItem, AppError> {
        self.db.update_tracked_application(input).await
    }

    pub async fn delete_tracked(&self, application_id: &str) -> Result<(), AppError> {
        self.db.delete_tracked_application(application_id).await
    }
}
