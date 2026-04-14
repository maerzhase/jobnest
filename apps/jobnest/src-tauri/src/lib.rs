mod commands;
mod db;
mod models;
mod services;

use std::{
    fs,
    path::PathBuf,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    thread,
    time::Duration,
};

use db::Database;
use serde::{Deserialize, Serialize};
use services::{ApplicationsService, SettingsService};
use specta_typescript::Typescript;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder},
    AppHandle, Manager, PhysicalPosition, PhysicalSize, RunEvent, Window, WindowEvent,
};

pub struct AppState {
    db: Database,
    applications: ApplicationsService,
    settings: SettingsService,
}

const WINDOW_STATE_FILE: &str = "window-state.json";
const WINDOW_STATE_FLUSH_DELAY_MS: u64 = 180;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PersistedWindowState {
    width: u32,
    height: u32,
    x: i32,
    y: i32,
    maximized: bool,
}

#[derive(Clone)]
struct WindowStateController {
    generation: Arc<AtomicU64>,
    snapshot: Arc<Mutex<PersistedWindowState>>,
}

impl WindowStateController {
    fn new() -> Self {
        Self {
            generation: Arc::new(AtomicU64::new(0)),
            snapshot: Arc::new(Mutex::new(PersistedWindowState {
                width: 800,
                height: 600,
                x: 0,
                y: 0,
                maximized: false,
            })),
        }
    }

    fn set_snapshot(&self, state: PersistedWindowState) {
        if let Ok(mut snapshot) = self.snapshot.lock() {
            *snapshot = state;
        }
    }

    fn update_size(&self, size: PhysicalSize<u32>) {
        if let Ok(mut snapshot) = self.snapshot.lock() {
            snapshot.width = size.width;
            snapshot.height = size.height;
        }
    }

    fn update_position(&self, position: PhysicalPosition<i32>) {
        if let Ok(mut snapshot) = self.snapshot.lock() {
            snapshot.x = position.x;
            snapshot.y = position.y;
        }
    }

    fn refresh_maximized(&self, window: &Window) {
        if let Ok(is_maximized) = window.is_maximized() {
            if let Ok(mut snapshot) = self.snapshot.lock() {
                snapshot.maximized = is_maximized;
            }
        }
    }

    fn persist_now(&self, app_handle: &AppHandle) {
        if let Err(err) = persist_window_state(app_handle, self.snapshot.clone()) {
            eprintln!("failed to persist window state: {err}");
        }
    }

    fn schedule(&self, app_handle: &AppHandle) {
        let next_generation = self.generation.fetch_add(1, Ordering::SeqCst) + 1;
        let latest_generation = Arc::clone(&self.generation);
        let snapshot = Arc::clone(&self.snapshot);
        let app_handle = app_handle.clone();

        thread::spawn(move || {
            thread::sleep(Duration::from_millis(WINDOW_STATE_FLUSH_DELAY_MS));

            if latest_generation.load(Ordering::SeqCst) != next_generation {
                return;
            }

            if let Err(err) = persist_window_state(&app_handle, snapshot) {
                eprintln!("failed to persist debounced window state: {err}");
            }
        });
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let specta_builder = tauri_specta::Builder::<tauri::Wry>::new()
        .error_handling(tauri_specta::ErrorHandlingMode::Throw)
        .commands(tauri_specta::collect_commands![
            commands::create_company,
            commands::create_role,
            commands::create_application,
            commands::create_tracked_application,
            commands::update_application_status,
            commands::update_tracked_application,
            commands::delete_tracked_application,
            commands::create_contact,
            commands::create_note,
            commands::search,
            commands::reindex_search,
            commands::list_applications,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::reset_app_data,
            commands::export_app_data,
            commands::import_app_data
        ]);

    let builder = tauri::Builder::default()
        .setup(|app| {
            let menu = build_menu(app)?;
            app.set_menu(menu)?;

            let db = tauri::async_runtime::block_on(Database::new(app.handle()))
                .map_err(|err| -> Box<dyn std::error::Error> { Box::new(err) })?;
            let applications = ApplicationsService::new(db.clone());
            let settings = SettingsService::new(db.clone());

            app.manage(AppState {
                db,
                applications,
                settings,
            });
            app.manage(WindowStateController::new());
            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::Moved(position) => {
                if let Some(controller) = window.app_handle().try_state::<WindowStateController>() {
                    controller.update_position(*position);
                    controller.refresh_maximized(window);
                    controller.persist_now(&window.app_handle());
                    controller.schedule(&window.app_handle());
                }
            }
            WindowEvent::Resized(size) => {
                if let Some(controller) = window.app_handle().try_state::<WindowStateController>() {
                    controller.update_size(*size);
                    controller.refresh_maximized(window);
                    controller.persist_now(&window.app_handle());
                    controller.schedule(&window.app_handle());
                }
            }
            WindowEvent::CloseRequested { .. } => {
                if let Some(controller) = window.app_handle().try_state::<WindowStateController>() {
                    controller.refresh_maximized(window);
                    controller.persist_now(&window.app_handle());
                }
            }
            _ => {}
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(specta_builder.invoke_handler());

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::Ready = event {
            if let Some(window) = app_handle.get_webview_window("main") {
                if let Err(err) = restore_window_state(&window, app_handle) {
                    eprintln!("failed to restore window state: {err}");
                }
            }
        }
    });
}

pub fn export_typescript_bindings() -> Result<(), Box<dyn std::error::Error>> {
    tauri_specta::Builder::<tauri::Wry>::new()
        .error_handling(tauri_specta::ErrorHandlingMode::Throw)
        .commands(tauri_specta::collect_commands![
            commands::create_company,
            commands::create_role,
            commands::create_application,
            commands::create_tracked_application,
            commands::update_application_status,
            commands::update_tracked_application,
            commands::delete_tracked_application,
            commands::create_contact,
            commands::create_note,
            commands::search,
            commands::reindex_search,
            commands::list_applications,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::reset_app_data,
            commands::export_app_data,
            commands::import_app_data
        ])
        .export(
            Typescript::default().header(
                "// biome-ignore-all lint: generated bindings\n\
             // This file is generated by `pnpm --filter jobnest api:generate`.\n",
            ),
            typescript_bindings_path(),
        )?;

    Ok(())
}

fn typescript_bindings_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/lib/api/bindings.ts")
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
            .item(&PredefinedMenuItem::about(app, Some("JobNest"), None)?)
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

fn restore_window_state(
    window: &tauri::WebviewWindow,
    app_handle: &AppHandle,
) -> Result<(), Box<dyn std::error::Error>> {
    let Some(state) = load_window_state(app_handle)? else {
        return Ok(());
    };

    if let Some(controller) = app_handle.try_state::<WindowStateController>() {
        controller.set_snapshot(state.clone());
    }

    window.set_size(PhysicalSize::new(state.width, state.height))?;
    window.set_position(PhysicalPosition::new(state.x, state.y))?;

    if state.maximized {
        window.maximize()?;
    }

    Ok(())
}

fn persist_window_state(
    app_handle: &AppHandle,
    snapshot: Arc<Mutex<PersistedWindowState>>,
) -> Result<(), Box<dyn std::error::Error>> {
    let state = snapshot
        .lock()
        .map_err(|_| std::io::Error::other("failed to lock window state snapshot"))?
        .clone();

    let path = window_state_path(app_handle)?;
    let contents = serde_json::to_vec_pretty(&state)?;
    fs::write(path, contents)?;

    Ok(())
}

fn load_window_state(
    app_handle: &AppHandle,
) -> Result<Option<PersistedWindowState>, Box<dyn std::error::Error>> {
    let path = window_state_path(app_handle)?;

    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read(path)?;
    let state = serde_json::from_slice(&contents)?;
    Ok(Some(state))
}

fn window_state_path(app_handle: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let app_data_dir = app_handle.path().app_data_dir()?;
    fs::create_dir_all(&app_data_dir)?;
    Ok(app_data_dir.join(WINDOW_STATE_FILE))
}
