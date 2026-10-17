use crate::protocol::{button_label_from_codes, default_buttons, ButtonAssignment, MouseConfig};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

pub const BACKUP_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MouseBackupEntry {
    pub id: String,
    pub schema_version: u32,
    pub name: String,
    pub created_at: String,
    pub firmware_version: Option<String>,
    pub config: MouseConfig,
    pub buttons: Vec<ButtonAssignment>,
}

#[derive(Debug, Clone)]
pub struct BackupStore {
    pub file_path: PathBuf,
}

impl BackupStore {
    pub fn new(file_path: PathBuf) -> Self {
        Self { file_path }
    }

    pub fn load_all(&self) -> Result<Vec<MouseBackupEntry>, String> {
        if !self.file_path.exists() {
            return Ok(Vec::new());
        }
        let raw = fs::read_to_string(&self.file_path)
            .map_err(|e| format!("Falha ao ler arquivo de backups: {}", e))?;
        if raw.trim().is_empty() {
            return Ok(Vec::new());
        }
        let mut entries: Vec<MouseBackupEntry> = serde_json::from_str(&raw)
            .map_err(|e| format!("Arquivo de backups inválido: {}", e))?;
        for entry in entries.iter_mut() {
            validate_and_sanitize_entry(entry)?;
        }
        Ok(entries)
    }

    fn persist_all(&self, entries: &[MouseBackupEntry]) -> Result<(), String> {
        if let Some(parent) = self.file_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Falha ao criar pasta de backups: {}", e))?;
        }
        let json = serde_json::to_string_pretty(entries)
            .map_err(|e| format!("Falha ao serializar backups: {}", e))?;
        fs::write(&self.file_path, json)
            .map_err(|e| format!("Falha ao gravar arquivo de backups: {}", e))
    }

    pub fn save_new(
        &self,
        name: String,
        firmware_version: Option<String>,
        config: MouseConfig,
        buttons: Vec<ButtonAssignment>,
    ) -> Result<Vec<MouseBackupEntry>, String> {
        let mut entries = self.load_all().unwrap_or_default();
        let now_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);
        let mut new_entry = MouseBackupEntry {
            id: format!("bkp-{}", now_ms),
            schema_version: BACKUP_SCHEMA_VERSION,
            name,
            created_at: format_unix_seconds(now_ms / 1000),
            firmware_version,
            config,
            buttons,
        };
        validate_and_sanitize_entry(&mut new_entry)?;
        entries.insert(0, new_entry);
        self.persist_all(&entries)?;
        Ok(entries)
    }

    pub fn delete_by_id(&self, id: &str) -> Result<Vec<MouseBackupEntry>, String> {
        let mut entries = self.load_all()?;
        entries.retain(|e| e.id != id);
        self.persist_all(&entries)?;
        Ok(entries)
    }

    pub fn export_single_json(entry: &MouseBackupEntry) -> Result<String, String> {
        let mut clean = entry.clone();
        validate_and_sanitize_entry(&mut clean)?;
        serde_json::to_string_pretty(&clean)
            .map_err(|e| format!("Falha ao exportar backup para JSON: {}", e))
    }

    pub fn import_single_json(
        &self,
        raw_json: &str,
        save_to_library: bool,
    ) -> Result<MouseBackupEntry, String> {
        let mut entry: MouseBackupEntry = serde_json::from_str(raw_json)
            .map_err(|e| format!("JSON de backup inválido ou corrompido: {}", e))?;
        validate_and_sanitize_entry(&mut entry)?;

        if save_to_library {
            let mut entries = self.load_all().unwrap_or_default();
            let now_ms = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_millis())
                .unwrap_or(0);
            if entry.id.trim().is_empty() || entries.iter().any(|e| e.id == entry.id) {
                entry.id = format!("bkp-imp-{}", now_ms);
            }
            entries.insert(0, entry.clone());
            self.persist_all(&entries)?;
        }
        Ok(entry)
    }
}

pub fn validate_and_sanitize_entry(entry: &mut MouseBackupEntry) -> Result<(), String> {
    if entry.schema_version != BACKUP_SCHEMA_VERSION {
        return Err(format!(
            "Versão de schema do backup incompatível: esperado {}, recebido {}",
            BACKUP_SCHEMA_VERSION, entry.schema_version
        ));
    }
    let trimmed = entry.name.trim();
    entry.name = if trimmed.is_empty() {
        "Backup Sem Nome".to_string()
    } else {
        trimmed.chars().take(64).collect()
    };

    entry.config.light_mode = entry.config.light_mode.min(6);
    entry.config.report_rate = entry.config.report_rate.min(3);
    entry.config.dpi_count = entry.config.dpi_count.clamp(1, 6);
    entry.config.dpi_flag = entry.config.dpi_count;
    entry.config.dpi_index = entry.config.dpi_index.min(5);
    entry.config.dpi1_value = entry.config.dpi1_value.clamp(200, 12000);
    entry.config.dpi2_value = entry.config.dpi2_value.clamp(200, 12000);
    entry.config.dpi3_value = entry.config.dpi3_value.clamp(200, 12000);
    entry.config.dpi4_value = entry.config.dpi4_value.clamp(200, 12000);
    entry.config.dpi5_value = entry.config.dpi5_value.clamp(200, 12000);
    entry.config.dpi6_value = entry.config.dpi6_value.clamp(200, 12000);
    entry.config.scroll_flag = entry.config.scroll_flag.min(1);
    entry.config.lod_value = entry.config.lod_value.clamp(1, 2);
    entry.config.key_respond = entry.config.key_respond.clamp(1, 30);
    entry.config.wakeup_flag = entry.config.wakeup_flag.min(1);
    entry.config.move_light_flag = entry.config.move_light_flag.min(1);

    let defaults = default_buttons();
    let mut normalized_buttons = Vec::with_capacity(6);
    for i in 0..6 {
        if let Some(existing) = entry.buttons.get(i) {
            if i == 0 && existing.r#type == 32 && existing.code1 == 0 {
                normalized_buttons.push(defaults[0].clone());
            } else {
                let safe_type = if existing.r#type == 64 {
                    16
                } else {
                    existing.r#type
                };
                let label = if existing.name.trim().is_empty() {
                    button_label_from_codes(
                        safe_type,
                        existing.code1,
                        existing.code2,
                        existing.code3,
                    )
                } else {
                    existing.name.clone()
                };
                normalized_buttons.push(ButtonAssignment {
                    index: i,
                    name: label,
                    r#type: safe_type,
                    code1: existing.code1,
                    code2: existing.code2,
                    code3: existing.code3,
                });
            }
        } else {
            normalized_buttons.push(defaults[i].clone());
        }
    }
    entry.buttons = normalized_buttons;
    Ok(())
}

fn format_unix_seconds(secs: u128) -> String {
    format!("TS-{}", secs)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::default_buttons;
    use std::env;
    use std::fs;

    fn temp_store_path(test_name: &str) -> PathBuf {
        let mut dir = env::temp_dir();
        dir.push(format!("ksnake_x11_test_{}_{}.json", test_name, std::process::id()));
        let _ = fs::remove_file(&dir);
        dir
    }

    #[test]
    fn test_create_list_and_delete_backups() {
        let path = temp_store_path("crud");
        let store = BackupStore::new(path.clone());

        let initial = store.load_all().expect("should load empty list");
        assert!(initial.is_empty());

        let mut cfg = MouseConfig::default();
        cfg.dpi1_value = 1600;
        let list = store
            .save_new(
                "Perfil FPS Competitivo".to_string(),
                Some("1.0.2".to_string()),
                cfg.clone(),
                default_buttons(),
            )
            .expect("should save backup");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].name, "Perfil FPS Competitivo");
        assert_eq!(list[0].config.dpi1_value, 1600);

        let after_del = store
            .delete_by_id(&list[0].id)
            .expect("should delete by id");
        assert!(after_del.is_empty());
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_import_export_single_backup_json() {
        let path = temp_store_path("import_export");
        let store = BackupStore::new(path.clone());

        let entry = MouseBackupEntry {
            id: "bkp-1".to_string(),
            schema_version: BACKUP_SCHEMA_VERSION,
            name: "Config Trabalho".to_string(),
            created_at: "2026-10-17".to_string(),
            firmware_version: Some("1.0.1".to_string()),
            config: MouseConfig::default(),
            buttons: default_buttons(),
        };

        let json = BackupStore::export_single_json(&entry).expect("should export json");
        let imported = store
            .import_single_json(&json, true)
            .expect("should import and save");
        assert_eq!(imported.name, "Config Trabalho");

        let saved = store.load_all().expect("should load saved");
        assert_eq!(saved.len(), 1);
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_reject_invalid_schema_version_or_corrupt_json() {
        let path = temp_store_path("corrupt");
        let store = BackupStore::new(path.clone());

        assert!(store.import_single_json("{bad json", false).is_err());

        let mut bad_schema = MouseBackupEntry {
            id: "bkp-bad".to_string(),
            schema_version: 999,
            name: "Invalido".to_string(),
            created_at: "2026-10-17".to_string(),
            firmware_version: None,
            config: MouseConfig::default(),
            buttons: default_buttons(),
        };
        assert!(validate_and_sanitize_entry(&mut bad_schema).is_err());
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn test_sanitize_imported_backup_dpi_and_buttons() {
        let mut entry = MouseBackupEntry {
            id: "bkp-sanitize".to_string(),
            schema_version: BACKUP_SCHEMA_VERSION,
            name: "   ".to_string(),
            created_at: "2026-10-17".to_string(),
            firmware_version: None,
            config: MouseConfig {
                dpi1_value: 50,
                dpi6_value: 50000,
                lod_value: 9,
                ..MouseConfig::default()
            },
            buttons: vec![],
        };
        validate_and_sanitize_entry(&mut entry).expect("should sanitize valid schema");
        assert_eq!(entry.name, "Backup Sem Nome");
        assert_eq!(entry.config.dpi1_value, 200);
        assert_eq!(entry.config.dpi6_value, 12000);
        assert_eq!(entry.config.lod_value, 2);
        assert_eq!(entry.buttons.len(), 6);
        assert_eq!(entry.buttons[0].r#type, 32);
        assert_eq!(entry.buttons[0].code1, 1);
    }
}
