mod commands;
mod db;
mod models;

use db::Database;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder},
    Manager,
};

pub struct AppState {
    db: Database,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let menu = build_menu(app)?;
            app.set_menu(menu)?;

            let db = tauri::async_runtime::block_on(Database::new(app.handle()))
                .map_err(|err| -> Box<dyn std::error::Error> { Box::new(err) })?;

            app.manage(AppState { db });
            Ok(())
        })
        .on_menu_event(|app, event| match event.id().0.as_str() {
            "open-settings" => {
                let _ = navigate_main_window(app, "/settings");
            }
            "open-home" => {
                let _ = navigate_main_window(app, "/");
            }
            _ => {}
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
            commands::list_applications,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::reset_app_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn build_menu(app: &tauri::App) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let open_home = MenuItemBuilder::with_id("open-home", "Applications").build(app)?;
    let open_settings = MenuItemBuilder::with_id("open-settings", "Settings…").build(app)?;
    let separator = PredefinedMenuItem::separator(app)?;

    let view_submenu = SubmenuBuilder::new(app, "View")
        .items(&[&open_home, &open_settings, &separator])
        .build()?;

    #[cfg(target_os = "macos")]
    let menu = {
        let app_submenu = SubmenuBuilder::new(app, "JobNest")
            .item(&PredefinedMenuItem::about(
                app,
                Some("JobNest"),
                None,
            )?)
            .separator()
            .item(&open_settings)
            .separator()
            .item(&PredefinedMenuItem::quit(app, None)?) 
            .build()?;

        MenuBuilder::new(app)
            .item(&app_submenu)
            .item(&view_submenu)
            .build()?
    };

    #[cfg(not(target_os = "macos"))]
    let menu = MenuBuilder::new(app).item(&view_submenu).build()?;

    Ok(menu)
}

fn navigate_main_window(app: &tauri::AppHandle, path: &str) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_focus()?;
        window.eval(&format!("window.location.replace({path:?});"))?;
    }

    Ok(())
}
