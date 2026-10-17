import { invoke } from "@tauri-apps/api/core";
import {
  ButtonAssignment,
  FullMouseState,
  MouseBackupEntry,
  MouseConfig,
} from "./types";

export async function connectMouse(demo: boolean): Promise<FullMouseState> {
  return await invoke<FullMouseState>("connect_mouse", { demo });
}

export async function getFullMouseState(): Promise<FullMouseState> {
  return await invoke<FullMouseState>("get_full_mouse_state");
}

export async function saveMouseConfig(
  config: MouseConfig
): Promise<FullMouseState> {
  return await invoke<FullMouseState>("save_mouse_config", { config });
}

export async function setMouseLightMode(mode: number): Promise<FullMouseState> {
  return await invoke<FullMouseState>("set_mouse_light_mode", { mode });
}

export async function saveMouseButtons(
  buttons: ButtonAssignment[]
): Promise<FullMouseState> {
  return await invoke<FullMouseState>("save_mouse_buttons", { buttons });
}

export async function resetMouseButtons(): Promise<FullMouseState> {
  return await invoke<FullMouseState>("reset_mouse_buttons");
}

export async function restoreFactorySettings(): Promise<FullMouseState> {
  return await invoke<FullMouseState>("restore_factory_settings");
}

export async function listBackups(): Promise<MouseBackupEntry[]> {
  return await invoke<MouseBackupEntry[]>("list_backups");
}

export async function createBackup(
  name: string,
  firmwareVersion: string | null,
  config: MouseConfig,
  buttons: ButtonAssignment[]
): Promise<MouseBackupEntry[]> {
  return await invoke<MouseBackupEntry[]>("create_backup", {
    name,
    firmwareVersion,
    config,
    buttons,
  });
}

export async function deleteBackup(id: string): Promise<MouseBackupEntry[]> {
  return await invoke<MouseBackupEntry[]>("delete_backup", { id });
}

export async function exportBackupJson(
  entry: MouseBackupEntry
): Promise<string> {
  return await invoke<string>("export_backup_json", { entry });
}

export async function importBackupJson(
  rawJson: string,
  saveToLibrary: boolean
): Promise<MouseBackupEntry> {
  return await invoke<MouseBackupEntry>("import_backup_json", {
    rawJson,
    saveToLibrary,
  });
}

export async function applyBackupToMouse(
  config: MouseConfig,
  buttons: ButtonAssignment[]
): Promise<FullMouseState> {
  return await invoke<FullMouseState>("apply_backup_to_mouse", {
    config,
    buttons,
  });
}

export async function windowMinimize(): Promise<void> {
  await invoke("window_minimize");
}

export async function windowToggleMaximize(): Promise<void> {
  await invoke("window_toggle_maximize");
}

export async function windowClose(): Promise<void> {
  await invoke("window_close");
}

export async function windowStartDrag(): Promise<void> {
  await invoke("window_start_drag");
}

export async function openExternalUrl(url: string): Promise<void> {
  await invoke("open_external_url", { url });
}


