mod db;
pub mod models;

pub use db::{AppError, Database};

pub type AppResult<T> = Result<T, AppError>;
