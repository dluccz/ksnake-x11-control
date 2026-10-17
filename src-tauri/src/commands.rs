use crate::backup::{BackupStore, MouseBackupEntry};
use crate::hid_manager::{FullMouseState, HidConnectionManager};
use crate::protocol::{ButtonAssignment, MouseConfig};
use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};

fn resolve_backup_store(app: &AppHandle) -> BackupStore {
    let base_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    BackupStore::new(base_dir.join("ksnake_x11_backups.json"))
}

#[tauri::command]
pub async fn connect_mouse(
    demo: bool,
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.connect(demo)
}

#[tauri::command]
pub async fn get_full_mouse_state(
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.get_state()
}

#[tauri::command]
pub async fn save_mouse_config(
    config: MouseConfig,
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.save_config(config)
}

#[tauri::command]
pub async fn set_mouse_light_mode(
    mode: u8,
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.set_light_mode(mode)
}

#[tauri::command]
pub async fn save_mouse_buttons(
    buttons: Vec<ButtonAssignment>,
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.save_buttons(buttons)
}

#[tauri::command]
pub async fn reset_mouse_buttons(
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.reset_buttons()
}

#[tauri::command]
pub async fn restore_factory_settings(
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.restore_factory()
}

#[tauri::command]
pub async fn list_backups(app: AppHandle) -> Result<Vec<MouseBackupEntry>, String> {
    resolve_backup_store(&app).load_all()
}

#[tauri::command]
pub async fn create_backup(
    name: String,
    firmware_version: Option<String>,
    config: MouseConfig,
    buttons: Vec<ButtonAssignment>,
    app: AppHandle,
) -> Result<Vec<MouseBackupEntry>, String> {
    resolve_backup_store(&app).save_new(name, firmware_version, config, buttons)
}

#[tauri::command]
pub async fn delete_backup(id: String, app: AppHandle) -> Result<Vec<MouseBackupEntry>, String> {
    resolve_backup_store(&app).delete_by_id(&id)
}

#[tauri::command]
pub async fn export_backup_json(entry: MouseBackupEntry) -> Result<String, String> {
    BackupStore::export_single_json(&entry)
}

#[tauri::command]
pub async fn import_backup_json(
    raw_json: String,
    save_to_library: bool,
    app: AppHandle,
) -> Result<MouseBackupEntry, String> {
    resolve_backup_store(&app).import_single_json(&raw_json, save_to_library)
}

#[tauri::command]
pub async fn apply_backup_to_mouse(
    config: MouseConfig,
    buttons: Vec<ButtonAssignment>,
    manager: State<'_, HidConnectionManager>,
) -> Result<FullMouseState, String> {
    manager.apply_backup(config, buttons)
}

#[tauri::command]
pub fn window_minimize(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
pub fn window_toggle_maximize(window: tauri::Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
pub fn window_close(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
pub fn window_start_drag(window: tauri::Window) {
    let _ = window.start_dragging();
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err("URL invalida".to_string());
    }
    let _ = std::process::Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn();
    Ok(())
}


