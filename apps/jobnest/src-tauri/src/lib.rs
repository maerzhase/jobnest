mod commands;
mod db;
mod models;
mod services;

use std::{
    fs,
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
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
    AppHandle, LogicalPosition, Manager, PhysicalPosition, PhysicalSize, TitleBarStyle, WebviewUrl,
    WebviewWindow, WebviewWindowBuilder, Window, WindowEvent,
};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

pub struct AppState {
    db: Database,
    applications: ApplicationsService,
    settings: SettingsService,
}

#[derive(Clone, Debug, Serialize, specta::Type)]
pub struct AvailableUpdate {
    version: String,
    current_version: String,
    body: Option<String>,
}

#[derive(Default)]
struct UpdateCheckController {
    in_progress: AtomicBool,
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
            commands::list_application_history,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::reset_app_data,
            commands::export_app_data,
            commands::import_app_data,
            commands::export_backup,
            commands::import_backup,
            commands::get_attachment_migration_status,
            commands::migrate_legacy_attachments,
            commands::check_for_available_update,
            commands::run_interactive_update_check
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
            app.manage(UpdateCheckController::default());

            let window = build_main_window(app)?;

            if let Err(err) = restore_window_state(&window, app.handle()) {
                eprintln!("failed to restore window state: {err}");
            }

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
            "open-history" => {
                let _ = navigate_main_window(app, "/history");
            }
            "open-home" => {
                let _ = navigate_main_window(app, "/");
            }
            "check-for-updates" => trigger_update_check(app),
            _ => {}
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(specta_builder.invoke_handler());

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_, _| {});
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
            commands::list_application_history,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::reset_app_data,
            commands::export_app_data,
            commands::import_app_data,
            commands::export_backup,
            commands::import_backup,
            commands::get_attachment_migration_status,
            commands::migrate_legacy_attachments,
            commands::check_for_available_update,
            commands::run_interactive_update_check
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

pub(crate) fn app_storage_dir(
    app_handle: &AppHandle,
) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let app_data_dir = app_handle.path().app_data_dir()?;

    #[cfg(debug_assertions)]
    {
        if let Some(folder_name) = app_data_dir.file_name() {
            let folder_name = folder_name.to_string_lossy();
            if folder_name.ends_with(".dev")
                || folder_name.ends_with("-dev")
                || folder_name.ends_with("_dev")
            {
                fs::create_dir_all(&app_data_dir)?;
                return Ok(app_data_dir);
            }

            let dev_folder_name = format!("{folder_name}-dev");
            let dev_app_data_dir = app_data_dir.with_file_name(dev_folder_name);
            fs::create_dir_all(&dev_app_data_dir)?;
            return Ok(dev_app_data_dir);
        }
    }

    fs::create_dir_all(&app_data_dir)?;
    Ok(app_data_dir)
}

fn app_display_name() -> &'static str {
    #[cfg(debug_assertions)]
    {
        "jobnest_dev"
    }

    #[cfg(not(debug_assertions))]
    {
        "jobnest"
    }
}

fn typescript_bindings_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/lib/api/bindings.ts")
}

fn build_menu(app: &tauri::App) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let open_home = MenuItemBuilder::with_id("open-home", "Applications").build(app)?;
    let open_history = MenuItemBuilder::with_id("open-history", "History").build(app)?;
    let open_settings = MenuItemBuilder::with_id("open-settings", "Settings…").build(app)?;
    let check_for_updates =
        MenuItemBuilder::with_id("check-for-updates", "Check for Updates…").build(app)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let edit_separator = PredefinedMenuItem::separator(app)?;
    let undo = PredefinedMenuItem::undo(app, None)?;
    let redo = PredefinedMenuItem::redo(app, None)?;
    let cut = PredefinedMenuItem::cut(app, None)?;
    let copy = PredefinedMenuItem::copy(app, None)?;
    let paste = PredefinedMenuItem::paste(app, None)?;
    let select_all = PredefinedMenuItem::select_all(app, None)?;

    let view_submenu = SubmenuBuilder::new(app, "View")
        .items(&[&open_home, &open_history, &open_settings, &separator])
        .build()?;

    let edit_submenu = SubmenuBuilder::new(app, "Edit")
        .items(&[
            &undo,
            &redo,
            &edit_separator,
            &cut,
            &copy,
            &paste,
            &select_all,
        ])
        .build()?;

    #[cfg(target_os = "macos")]
    let menu = {
        let app_name = app_display_name();
        let app_submenu = SubmenuBuilder::new(app, app_name)
            .item(&PredefinedMenuItem::about(app, Some(app_name), None)?)
            .separator()
            .item(&check_for_updates)
            .separator()
            .item(&open_settings)
            .separator()
            .item(&PredefinedMenuItem::quit(app, None)?)
            .build()?;

        MenuBuilder::new(app)
            .item(&app_submenu)
            .item(&edit_submenu)
            .item(&view_submenu)
            .build()?
    };

    #[cfg(not(target_os = "macos"))]
    let menu = {
        let help_submenu = SubmenuBuilder::new(app, "Help")
            .item(&check_for_updates)
            .build()?;

        MenuBuilder::new(app)
            .item(&edit_submenu)
            .item(&view_submenu)
            .item(&help_submenu)
            .build()?
    };

    Ok(menu)
}

fn build_main_window(app: &tauri::App) -> tauri::Result<WebviewWindow> {
    let window_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title(app_display_name())
        .inner_size(800.0, 600.0);

    #[cfg(target_os = "macos")]
    let window_builder = window_builder
        .title_bar_style(TitleBarStyle::Overlay)
        .traffic_light_position(LogicalPosition::new(16.0, 22.0))
        .hidden_title(true);

    window_builder.build()
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
    Ok(app_storage_dir(app_handle)?.join(WINDOW_STATE_FILE))
}

fn trigger_update_check(app: &AppHandle) {
    let Some(guard) = try_start_update_check(app) else {
        show_message_dialog(
            app,
            "Update check already in progress",
            "JobNest is already checking for an update. Please wait a moment.",
            MessageDialogKind::Info,
        );
        return;
    };

    let app_handle = app.clone();
    thread::spawn(move || {
        let _guard = guard;

        if let Err(err) = run_update_check(&app_handle) {
            eprintln!("failed to check for updates: {err}");
            show_message_dialog(
                &app_handle,
                "Unable to check for updates",
                &format_update_error(&err),
                MessageDialogKind::Error,
            );
        }
    });
}

struct UpdateCheckGuard {
    app_handle: AppHandle,
}

impl UpdateCheckGuard {
    fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }
}

fn try_start_update_check(app: &AppHandle) -> Option<UpdateCheckGuard> {
    let already_running = app
        .state::<UpdateCheckController>()
        .in_progress
        .swap(true, Ordering::SeqCst);

    if already_running {
        None
    } else {
        Some(UpdateCheckGuard::new(app.clone()))
    }
}

impl Drop for UpdateCheckGuard {
    fn drop(&mut self) {
        self.app_handle
            .state::<UpdateCheckController>()
            .in_progress
            .store(false, Ordering::SeqCst);
    }
}

pub async fn check_for_available_update_with_guard(
    app: AppHandle,
) -> Result<Option<AvailableUpdate>, String> {
    #[cfg(desktop)]
    {
        let updater = app.updater().map_err(|err| err.to_string())?;
        let update = updater.check().await.map_err(|err| err.to_string())?;

        Ok(update.map(|update| AvailableUpdate {
            version: update.version.to_string(),
            current_version: update.current_version.to_string(),
            body: update.body,
        }))
    }

    #[cfg(not(desktop))]
    {
        let _ = app;
        Ok(None)
    }
}

pub async fn run_interactive_update_check_with_guard(app: AppHandle) -> Result<(), String> {
    let Some(_guard) = try_start_update_check(&app) else {
        return Err("An update check is already in progress.".into());
    };

    let app_handle = app.clone();
    tauri::async_runtime::spawn_blocking(move || run_update_check(&app_handle))
        .await
        .map_err(|err| err.to_string())?
}

fn run_update_check(app: &AppHandle) -> Result<(), String> {
    let update =
        tauri::async_runtime::block_on(check_for_available_update_with_guard(app.clone()))?;

    let Some(update) = update else {
        show_message_dialog(
            app,
            "You’re up to date",
            "JobNest is already on the latest available version.",
            MessageDialogKind::Info,
        );
        return Ok(());
    };

    let mut prompt = format!(
        "Version {} is available. You’re currently on {}.",
        update.version, update.current_version
    );

    if let Some(notes) = update
        .body
        .as_deref()
        .map(str::trim)
        .filter(|notes| !notes.is_empty())
    {
        prompt.push_str("\n\nWhat’s new:\n");
        prompt.push_str(notes);
    }

    let should_install = ask_confirmation_dialog(
        app,
        "Install update?",
        &prompt,
        MessageDialogButtons::OkCancelCustom("Install now".into(), "Later".into()),
        MessageDialogKind::Info,
    );

    if !should_install {
        return Ok(());
    }

    show_message_dialog(
        app,
        "Installing update",
        "JobNest is downloading and installing the update now. You’ll be asked to restart when it finishes.",
        MessageDialogKind::Info,
    );

    tauri::async_runtime::block_on(async {
        app.updater()
            .map_err(|err| err.to_string())?
            .check()
            .await
            .map_err(|err| err.to_string())?
            .ok_or_else(|| "No update was available when installation started.".to_string())?
            .download_and_install(|_, _| {}, || {})
            .await
            .map_err(|err| err.to_string())
    })?;

    let should_restart = ask_confirmation_dialog(
        app,
        "Restart to finish update?",
        &format!(
            "JobNest {} has been installed successfully. Restart now to finish applying the update.",
            update.version
        ),
        MessageDialogButtons::OkCancelCustom("Restart now".into(), "Later".into()),
        MessageDialogKind::Info,
    );

    if should_restart {
        app.restart();
    }

    Ok(())
}

fn ask_confirmation_dialog(
    app: &AppHandle,
    title: &str,
    message: &str,
    buttons: MessageDialogButtons,
    kind: MessageDialogKind,
) -> bool {
    dialog_builder(app, title, message)
        .buttons(buttons)
        .kind(kind)
        .blocking_show()
}

fn show_message_dialog(app: &AppHandle, title: &str, message: &str, kind: MessageDialogKind) {
    dialog_builder(app, title, message)
        .buttons(MessageDialogButtons::Ok)
        .kind(kind)
        .show(|_| {});
}

fn dialog_builder<'a>(
    app: &AppHandle,
    title: &'a str,
    message: &'a str,
) -> tauri_plugin_dialog::MessageDialogBuilder<tauri::Wry> {
    let builder = app.dialog().message(message).title(title);

    if let Some(window) = app.get_webview_window("main") {
        builder.parent(&window)
    } else {
        builder
    }
}

fn format_update_error(error: &str) -> String {
    if error.contains("updater plugin is not configured")
        || error.contains("updater endpoint")
        || error.contains("pubkey")
    {
        "Updater is not configured for this build yet. Add the updater public key and release endpoint before shipping in-app updates.".into()
    } else {
        format!("JobNest couldn’t complete the update check.\n\nDetails: {error}")
    }
}
