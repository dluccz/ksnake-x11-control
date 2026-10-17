use crate::protocol::{
    button_label_from_codes, decode_battery, decode_config, decode_keys, decode_online,
    decode_version, default_buttons, encode_get_battery, encode_get_config, encode_get_keys,
    encode_get_online, encode_get_version, encode_reset_keys, encode_set_config,
    encode_set_keys, encode_set_light_mode, BatteryInfo, ButtonAssignment, MouseConfig,
    PACKET_LEN, PID_X11, USAGE_ID, USAGE_PAGE, VID_24G, VID_USB,
};
use hidapi::{HidApi, HidDevice};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FullMouseState {
    pub connected: bool,
    pub demo_mode: bool,
    pub connect_mode: String,
    pub online: bool,
    pub firmware_version: String,
    pub battery: BatteryInfo,
    pub config: MouseConfig,
    pub buttons: Vec<ButtonAssignment>,
}

pub struct HidConnectionManager {
    inner: Mutex<ManagerInner>,
}

struct ManagerInner {
    pub demo_mode: bool,
    pub cached_device: Option<HidDevice>,
    pub state: FullMouseState,
}

impl Default for HidConnectionManager {
    fn default() -> Self {
        Self::new()
    }
}

impl HidConnectionManager {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(ManagerInner {
                demo_mode: false,
                cached_device: None,
                state: FullMouseState {
                    connected: false,
                    demo_mode: false,
                    connect_mode: "Desconectado".to_string(),
                    online: false,
                    firmware_version: "0.0.0".to_string(),
                    battery: BatteryInfo {
                        battery_value: 0,
                        charge_flag: 0,
                    },
                    config: MouseConfig::default(),
                    buttons: default_buttons(),
                },
            }),
        }
    }

    fn open_hardware_device() -> Result<(HidDevice, u16), String> {
        let api = HidApi::new().map_err(|e| format!("Erro ao inicializar HID API: {}", e))?;

        for info in api.device_list() {
            let vid = info.vendor_id();
            let pid = info.product_id();
            if (vid == VID_USB || vid == VID_24G)
                && pid == PID_X11
                && info.usage_page() == USAGE_PAGE
                && info.usage() == USAGE_ID
            {
                let dev = info
                    .open_device(&api)
                    .map_err(|e| format!("Falha ao abrir porta HID: {}", e))?;
                return Ok((dev, vid));
            }
        }

        for info in api.device_list() {
            let vid = info.vendor_id();
            let pid = info.product_id();
            if (vid == VID_USB || vid == VID_24G) && pid == PID_X11 && info.usage_page() == USAGE_PAGE {
                if let Ok(dev) = info.open_device(&api) {
                    return Ok((dev, vid));
                }
            }
        }

        Err("K-Snake X11 nao detectado via USB ou 2.4G.".to_string())
    }

    fn query_packet(
        dev: &HidDevice,
        packet: &[u8; PACKET_LEN],
        timeout_ms: i32,
    ) -> Result<[u8; PACKET_LEN], String> {
        let expected_cmd = packet[2];
        let mut drain_buf = [0u8; PACKET_LEN];
        while let Ok(n) = dev.read_timeout(&mut drain_buf, 5) {
            if n == 0 {
                break;
            }
        }

        dev.write(packet)
            .map_err(|e| format!("Erro de escrita HID: {}", e))?;

        let mut fallback_resp = [0u8; PACKET_LEN];
        for _ in 0..8 {
            let mut resp = [0u8; PACKET_LEN];
            match dev.read_timeout(&mut resp, timeout_ms) {
                Ok(n) if n > 0 => {
                    let norm = crate::protocol::normalize_hid_input_report(&resp);
                    if norm.len() > 2 && norm[0] == 170 && norm[1] == expected_cmd {
                        return Ok(resp);
                    }
                    if expected_cmd == 48
                        && norm.len() > 10
                        && norm[0] == 170
                        && norm[1] == 250
                        && norm[8] == 208
                    {
                        return Ok(resp);
                    }
                    fallback_resp = resp;
                }
                _ => break,
            }
        }
        Ok(fallback_resp)
    }

    fn write_fast(inner: &mut ManagerInner, packet: &[u8; PACKET_LEN]) -> Result<(), String> {
        if inner.demo_mode {
            return Ok(());
        }
        if inner.cached_device.is_none() {
            let (dev, vid) = Self::open_hardware_device()?;
            inner.state.connect_mode = if vid == VID_USB {
                "USB".to_string()
            } else {
                "2.4G".to_string()
            };
            inner.cached_device = Some(dev);
        }

        let write_res = if let Some(ref dev) = inner.cached_device {
            dev.write(packet).map(|_| {
                let mut ack = [0u8; PACKET_LEN];
                let _ = dev.read_timeout(&mut ack, 25);
            })
        } else {
            Ok(())
        };

        if write_res.is_err() {
            inner.cached_device = None;
            let (dev, vid) = Self::open_hardware_device()?;
            inner.state.connect_mode = if vid == VID_USB {
                "USB".to_string()
            } else {
                "2.4G".to_string()
            };
            dev.write(packet)
                .map_err(|e| format!("Erro ao gravar no mouse: {}", e))?;
            let mut ack = [0u8; PACKET_LEN];
            let _ = dev.read_timeout(&mut ack, 25);
            inner.cached_device = Some(dev);
        }
        Ok(())
    }

    pub fn connect(&self, demo: bool) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;

        if demo {
            guard.demo_mode = true;
            guard.cached_device = None;
            guard.state = FullMouseState {
                connected: true,
                demo_mode: true,
                connect_mode: "2.4G (Simulado)".to_string(),
                online: true,
                firmware_version: "1.0.2".to_string(),
                battery: BatteryInfo {
                    battery_value: 85,
                    charge_flag: 0,
                },
                config: MouseConfig::default(),
                buttons: default_buttons(),
            };
            return Ok(guard.state.clone());
        }

        let (dev, vid) = Self::open_hardware_device()?;
        let connect_mode = if vid == VID_USB {
            "USB".to_string()
        } else {
            "2.4G".to_string()
        };

        let ver_resp = Self::query_packet(&dev, &encode_get_version(), 250)?;
        let firmware_version = decode_version(&ver_resp);

        let onl_resp = Self::query_packet(&dev, &encode_get_online(), 250)?;
        let online = decode_online(&onl_resp);

        let mut battery = BatteryInfo {
            battery_value: 0,
            charge_flag: 0,
        };
        for _ in 0..3 {
            let bat_resp = Self::query_packet(&dev, &encode_get_battery(), 280)?;
            let parsed = decode_battery(&bat_resp);
            if parsed.battery_value > 0 {
                battery = parsed;
                break;
            }
        }
        if battery.battery_value == 0 && guard.state.battery.battery_value > 0 {
            battery = guard.state.battery.clone();
        }

        let keys_resp = Self::query_packet(&dev, &encode_get_keys(), 250)?;
        let buttons = decode_keys(&keys_resp);

        let cfg_resp = Self::query_packet(&dev, &encode_get_config(), 250)?;
        let config = decode_config(&cfg_resp);

        guard.demo_mode = false;
        guard.cached_device = Some(dev);
        guard.state = FullMouseState {
            connected: true,
            demo_mode: false,
            connect_mode,
            online,
            firmware_version,
            battery,
            config,
            buttons,
        };

        Ok(guard.state.clone())
    }

    pub fn get_state(&self) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;
        if !guard.demo_mode {
            let inner: &mut ManagerInner = &mut guard;
            if let Some(ref dev) = inner.cached_device {
                let mut async_buf = [0u8; PACKET_LEN];
                while let Ok(n) = dev.read_timeout(&mut async_buf, 2) {
                    if n == 0 {
                        break;
                    }
                    if let Some(evt) = crate::protocol::decode_async_event(&async_buf) {
                        match evt {
                            crate::protocol::AsyncMouseEvent::Battery {
                                battery,
                                charge_flag,
                            } => {
                                if battery > 0 {
                                    inner.state.battery = BatteryInfo {
                                        battery_value: battery,
                                        charge_flag,
                                    };
                                }
                            }
                            crate::protocol::AsyncMouseEvent::Status {
                                dpi_index,
                                report_rate,
                            } => {
                                inner.state.config.dpi_index = dpi_index;
                                inner.state.config.report_rate = report_rate;
                            }
                            crate::protocol::AsyncMouseEvent::Online { online } => {
                                inner.state.online = online;
                            }
                        }
                    }
                }
                if let Ok(bat_resp) = Self::query_packet(dev, &encode_get_battery(), 200) {
                    let parsed = decode_battery(&bat_resp);
                    if parsed.battery_value > 0 {
                        inner.state.battery = parsed;
                    }
                }
            }
        }
        Ok(guard.state.clone())
    }

    pub fn save_config(&self, mut config: MouseConfig) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;
        config.dpi1_value = config.dpi1_value.clamp(200, 12000);
        config.dpi2_value = config.dpi2_value.clamp(200, 12000);
        config.dpi3_value = config.dpi3_value.clamp(200, 12000);
        config.dpi4_value = config.dpi4_value.clamp(200, 12000);
        config.dpi5_value = config.dpi5_value.clamp(200, 12000);
        config.dpi6_value = config.dpi6_value.clamp(200, 12000);
        config.dpi_count = config.dpi_count.clamp(1, 6);
        config.dpi_flag = config.dpi_count;
        config.dpi_index = config.dpi_index.min(5);
        config.lod_value = config.lod_value.clamp(1, 2);
        config.key_respond = config.key_respond.clamp(1, 30);

        let pkt = encode_set_config(&config);
        Self::write_fast(&mut guard, &pkt)?;

        guard.state.config = config;
        Ok(guard.state.clone())
    }

    pub fn set_light_mode(&self, mode: u8) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;
        let clamped = mode.min(6);

        let pkt = encode_set_light_mode(clamped);
        Self::write_fast(&mut guard, &pkt)?;
        guard.state.config.light_mode = clamped;

        let cfg_pkt = encode_set_config(&guard.state.config);
        let _ = Self::write_fast(&mut guard, &cfg_pkt);

        Ok(guard.state.clone())
    }

    pub fn save_buttons(&self, mut buttons: Vec<ButtonAssignment>) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;
        let defaults = default_buttons();
        if buttons.len() < 6 {
            buttons = defaults;
        } else {
            if buttons[0].r#type == 32 && buttons[0].code1 == 0 {
                buttons[0] = defaults[0].clone();
            }
            for (i, b) in buttons.iter_mut().take(6).enumerate() {
                b.index = i;
                if b.name.trim().is_empty() {
                    b.name = button_label_from_codes(b.r#type, b.code1, b.code2, b.code3);
                }
            }
        }

        let pkt = encode_set_keys(&buttons);
        Self::write_fast(&mut guard, &pkt)?;

        guard.state.buttons = buttons.into_iter().take(6).collect();
        Ok(guard.state.clone())
    }

    pub fn reset_buttons(&self) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;

        let pkt = encode_reset_keys();
        Self::write_fast(&mut guard, &pkt)?;

        guard.state.buttons = default_buttons();
        Ok(guard.state.clone())
    }

    pub fn restore_factory(&self) -> Result<FullMouseState, String> {
        let mut guard = self.inner.lock().map_err(|_| "Mutex lock error".to_string())?;
        let factory_cfg = MouseConfig {
            light_mode: 0,
            ..MouseConfig::default()
        };

        Self::write_fast(&mut guard, &encode_reset_keys())?;
        Self::write_fast(&mut guard, &encode_set_config(&factory_cfg))?;
        Self::write_fast(&mut guard, &encode_set_light_mode(factory_cfg.light_mode))?;

        guard.state.config = factory_cfg;
        guard.state.buttons = default_buttons();
        Ok(guard.state.clone())
    }

    pub fn apply_backup(
        &self,
        config: MouseConfig,
        buttons: Vec<ButtonAssignment>,
    ) -> Result<FullMouseState, String> {
        let _ = self.save_config(config.clone())?;
        let _ = self.set_light_mode(config.light_mode)?;
        self.save_buttons(buttons)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::SENSOR_FLAG_MOTION_SYNC;

    #[test]
    fn test_demo_mode_full_lifecycle_and_backup_restore() {
        let mgr = HidConnectionManager::new();
        let st = mgr.connect(true).expect("demo connect should succeed");
        assert!(st.connected);
        assert!(st.demo_mode);
        assert_eq!(st.buttons.len(), 6);

        let mut new_cfg = st.config.clone();
        new_cfg.dpi1_value = 1600;
        new_cfg.lod_value = 2;
        new_cfg.sensor_flag = SENSOR_FLAG_MOTION_SYNC;
        let updated = mgr
            .save_config(new_cfg.clone())
            .expect("save_config should succeed");
        assert_eq!(updated.config.dpi1_value, 1600);
        assert_eq!(updated.config.lod_value, 2);

        let factory = mgr
            .restore_factory()
            .expect("restore_factory should succeed");
        assert_eq!(factory.config.dpi1_value, 800);
        assert_eq!(factory.config.light_mode, 0);

        let restored = mgr
            .apply_backup(new_cfg.clone(), st.buttons.clone())
            .expect("apply_backup should succeed");
        assert_eq!(restored.config.dpi1_value, 1600);
        assert_eq!(restored.config.lod_value, 2);
    }
}
