mod commands;
mod db;
mod models;

use db::Database;
use tauri::Manager;

pub struct AppState {
    db: Database,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db = tauri::async_runtime::block_on(Database::new(app.handle()))
                .map_err(|err| -> Box<dyn std::error::Error> { Box::new(err) })?;

            app.manage(AppState { db });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::create_company,
            commands::create_role,
            commands::create_application,
            commands::create_tracked_application,
            commands::update_application_status,
            commands::create_contact,
            commands::create_note,
            commands::search,
            commands::reindex_search,
            commands::list_applications
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
