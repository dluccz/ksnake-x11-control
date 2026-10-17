pub mod backup;
pub mod commands;
pub mod hid_manager;
pub mod protocol;

use hid_manager::HidConnectionManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(HidConnectionManager::new())
        .invoke_handler(tauri::generate_handler![
            commands::connect_mouse,
            commands::get_full_mouse_state,
            commands::save_mouse_config,
            commands::set_mouse_light_mode,
            commands::save_mouse_buttons,
            commands::reset_mouse_buttons,
            commands::restore_factory_settings,
            commands::list_backups,
            commands::create_backup,
            commands::delete_backup,
            commands::export_backup_json,
            commands::import_backup_json,
            commands::apply_backup_to_mouse,
            commands::window_minimize,
            commands::window_toggle_maximize,
            commands::window_close,
            commands::window_start_drag,
            commands::open_external_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
