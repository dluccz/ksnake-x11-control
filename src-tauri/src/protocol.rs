use serde::{Deserialize, Serialize};

pub const VID_USB: u16 = 0xA8A4;
pub const VID_24G: u16 = 0xA8A5;
pub const PID_X11: u16 = 0x2255;
pub const USAGE_PAGE: u16 = 0xFF01;
pub const USAGE_ID: u16 = 0x0010;
pub const PACKET_LEN: usize = 65;

pub const SENSOR_FLAG_RIPPLE_CONTROL: u8 = 1;
pub const SENSOR_FLAG_LINEAR_CORRECTION: u8 = 16;
pub const SENSOR_FLAG_MOTION_SYNC: u8 = 32;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BatteryInfo {
    pub battery_value: u8,
    pub charge_flag: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ButtonAssignment {
    pub index: usize,
    pub name: String,
    pub r#type: u8,
    pub code1: u8,
    pub code2: u8,
    pub code3: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MouseConfig {
    pub light_mode: u8,
    pub report_rate: u8,
    pub dpi_index: u8,
    pub dpi_flag: u8,
    pub dpi_count: u8,
    pub dpi1_value: u16,
    pub dpi2_value: u16,
    pub dpi3_value: u16,
    pub dpi4_value: u16,
    pub dpi5_value: u16,
    pub dpi6_value: u16,
    pub scroll_flag: u8,
    pub lod_value: u8,
    pub sensor_flag: u8,
    pub key_respond: u8,
    pub sleep_light: u8,
    pub highspeed_mode: u8,
    pub wakeup_flag: u8,
    pub move_light_flag: u8,
}

impl Default for MouseConfig {
    fn default() -> Self {
        Self {
            light_mode: 2,
            report_rate: 3,
            dpi_index: 2,
            dpi_flag: 5,
            dpi_count: 5,
            dpi1_value: 800,
            dpi2_value: 1200,
            dpi3_value: 1600,
            dpi4_value: 3200,
            dpi5_value: 5000,
            dpi6_value: 12000,
            scroll_flag: 0,
            lod_value: 1,
            sensor_flag: 53,
            key_respond: 2,
            sleep_light: 10,
            highspeed_mode: 0,
            wakeup_flag: 1,
            move_light_flag: 1,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AsyncMouseEvent {
    Battery { battery: u8, charge_flag: u8 },
    Status { dpi_index: u8, report_rate: u8 },
    Online { online: bool },
}

pub fn normalize_hid_input_report(raw: &[u8]) -> &[u8] {
    if raw.len() == PACKET_LEN && raw[0] == 0 && (raw[1] == 170 || raw[1] == 85 || raw[1] == 19) {
        &raw[1..]
    } else {
        raw
    }
}

pub fn default_buttons() -> Vec<ButtonAssignment> {
    vec![
        ButtonAssignment {
            index: 0,
            name: "Botão Esquerdo".to_string(),
            r#type: 32,
            code1: 1,
            code2: 0,
            code3: 0,
        },
        ButtonAssignment {
            index: 1,
            name: "Botão Direito".to_string(),
            r#type: 32,
            code1: 2,
            code2: 0,
            code3: 0,
        },
        ButtonAssignment {
            index: 2,
            name: "Botão do Meio".to_string(),
            r#type: 32,
            code1: 4,
            code2: 0,
            code3: 0,
        },
        ButtonAssignment {
            index: 3,
            name: "Voltar".to_string(),
            r#type: 32,
            code1: 8,
            code2: 0,
            code3: 0,
        },
        ButtonAssignment {
            index: 4,
            name: "Avançar".to_string(),
            r#type: 32,
            code1: 16,
            code2: 0,
            code3: 0,
        },
        ButtonAssignment {
            index: 5,
            name: "Ciclo de DPI".to_string(),
            r#type: 33,
            code1: 85,
            code2: 0,
            code3: 0,
        },
    ]
}

pub fn button_label_from_codes(r#type: u8, code1: u8, code2: u8, code3: u8) -> String {
    match (r#type, code1, code2, code3) {
        (32, 1, 0, 0) => "Botão Esquerdo".to_string(),
        (32, 2, 0, 0) => "Botão Direito".to_string(),
        (32, 4, 0, 0) => "Botão do Meio".to_string(),
        (32, 8, 0, 0) => "Voltar".to_string(),
        (32, 16, 0, 0) => "Avançar".to_string(),
        (32, 0, 0, 0) => "Desativado".to_string(),
        (33, 56, 1, 0) => "Scroll para Cima".to_string(),
        (33, 56, 255, 0) => "Scroll para Baixo".to_string(),
        (33, 85, 0, 0) | (240, 1, 1, 0) => "Ciclo de DPI".to_string(),
        (48, 233, 0, 0) => "Volume +".to_string(),
        (48, 234, 0, 0) => "Volume -".to_string(),
        (48, 226, 0, 0) => "Mudo".to_string(),
        (48, 205, 0, 0) => "Play/Pause".to_string(),
        (48, 183, 0, 0) => "Parar Mídia".to_string(),
        (48, 182, 0, 0) => "Faixa Anterior".to_string(),
        (48, 181, 0, 0) => "Próxima Faixa".to_string(),
        (48, 131, 1, 0) => "Multimídia".to_string(),
        (48, 35, 2, 0) => "Página Inicial".to_string(),
        (48, 39, 2, 0) => "Atualizar Página".to_string(),
        (48, 38, 2, 0) => "Parar Carregamento".to_string(),
        (48, 37, 2, 0) => "Avançar Página".to_string(),
        (48, 36, 2, 0) => "Voltar Página".to_string(),
        (48, 42, 2, 0) => "Favoritos".to_string(),
        (48, 33, 2, 0) => "Pesquisar".to_string(),
        (48, 146, 1, 0) => "Calculadora".to_string(),
        (48, 148, 1, 0) => "Meu Computador".to_string(),
        (48, 138, 1, 0) => "E-mail".to_string(),
        (16, mods, key, _) => {
            let mut parts = Vec::new();
            if (mods & 1) != 0 || ((mods >> 4) & 1) != 0 {
                parts.push("Ctrl".to_string());
            }
            if ((mods >> 1) & 1) != 0 || ((mods >> 5) & 1) != 0 {
                parts.push("Shift".to_string());
            }
            if ((mods >> 2) & 1) != 0 || ((mods >> 6) & 1) != 0 {
                parts.push("Alt".to_string());
            }
            if ((mods >> 3) & 1) != 0 || ((mods >> 7) & 1) != 0 {
                parts.push("Win".to_string());
            }
            if key != 0 {
                parts.push(hid_key_name(key));
            }
            if parts.is_empty() {
                "Tecla Personalizada".to_string()
            } else {
                parts.join(" + ")
            }
        }
        _ => format!("Comando ({}, {}, {})", r#type, code1, code2),
    }
}

pub fn hid_key_name(code: u8) -> String {
    match code {
        4..=29 => ((b'A' + (code - 4)) as char).to_string(),
        30..=38 => ((b'1' + (code - 30)) as char).to_string(),
        39 => "0".to_string(),
        40 => "Enter".to_string(),
        41 => "Esc".to_string(),
        42 => "Backspace".to_string(),
        43 => "Tab".to_string(),
        44 => "Espaço".to_string(),
        45 => "-".to_string(),
        46 => "=".to_string(),
        57 => "CapsLock".to_string(),
        58..=69 => format!("F{}", code - 57),
        70 => "PrintScreen".to_string(),
        73 => "Insert".to_string(),
        74 => "Home".to_string(),
        75 => "PageUp".to_string(),
        76 => "Delete".to_string(),
        77 => "End".to_string(),
        78 => "PageDown".to_string(),
        79 => "Seta Direita".to_string(),
        80 => "Seta Esquerda".to_string(),
        81 => "Seta Baixo".to_string(),
        82 => "Seta Cima".to_string(),
        _ => format!("Key({})", code),
    }
}

pub fn encode_get_version() -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 3;
    pkt
}

pub fn decode_version(raw_resp: &[u8]) -> String {
    let resp = normalize_hid_input_report(raw_resp);
    if resp.len() < 26 {
        return "0.0.0".to_string();
    }
    let digit_or_zero = |b: u8| -> char {
        if (48..=57).contains(&b) {
            b as char
        } else {
            '0'
        }
    };
    format!(
        "{}.{}.{}",
        digit_or_zero(resp[23]),
        digit_or_zero(resp[24]),
        digit_or_zero(resp[25])
    )
}

pub fn encode_get_online() -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 237;
    pkt[3] = 0;
    pkt[4] = 1;
    pkt[5] = 46;
    pkt
}

pub fn decode_online(raw_resp: &[u8]) -> bool {
    let resp = normalize_hid_input_report(raw_resp);
    resp.len() > 8 && resp[8] == 2
}

pub fn encode_get_battery() -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 48;
    pkt[3] = 165;
    pkt[4] = 11;
    pkt[5] = 46;
    pkt[6] = 1;
    pkt[7] = 1;
    pkt
}

pub fn decode_battery(raw_resp: &[u8]) -> BatteryInfo {
    let resp = normalize_hid_input_report(raw_resp);
    if resp.len() < 11 {
        return BatteryInfo {
            battery_value: 0,
            charge_flag: 0,
        };
    }
    if resp[0] == 170 && resp[1] == 250 && resp[8] == 208 {
        return BatteryInfo {
            battery_value: resp[9].min(100),
            charge_flag: resp[10],
        };
    }
    BatteryInfo {
        battery_value: resp[8].min(100),
        charge_flag: resp[9],
    }
}

pub fn encode_get_config() -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 14;
    pkt[3] = 165;
    pkt[4] = 11;
    pkt[5] = 47;
    pkt[6] = 1;
    pkt[7] = 1;
    pkt
}

pub fn decode_config(raw_resp: &[u8]) -> MouseConfig {
    let resp = normalize_hid_input_report(raw_resp);
    if resp.len() < 56 {
        return MouseConfig::default();
    }
    if (resp[13] == 0 && resp[14] == 0 && resp[15] == 0)
        || (resp[13] == 255 && resp[14] == 255 && resp[15] == 255)
    {
        return MouseConfig::default();
    }
    MouseConfig {
        light_mode: resp[9],
        report_rate: resp[10].saturating_sub(1),
        dpi_index: resp[12].saturating_sub(1),
        dpi_flag: resp[11],
        dpi_count: resp[11],
        dpi1_value: u16::from_le_bytes([resp[13], resp[14]]),
        dpi2_value: u16::from_le_bytes([resp[15], resp[16]]),
        dpi3_value: u16::from_le_bytes([resp[17], resp[18]]),
        dpi4_value: u16::from_le_bytes([resp[19], resp[20]]),
        dpi5_value: u16::from_le_bytes([resp[21], resp[22]]),
        dpi6_value: u16::from_le_bytes([resp[23], resp[24]]),
        scroll_flag: resp[48],
        lod_value: resp[49],
        sensor_flag: resp[50],
        key_respond: resp[51],
        sleep_light: resp[52],
        highspeed_mode: resp[53],
        wakeup_flag: resp[55] & 0x0F,
        move_light_flag: (resp[55] >> 4) & 0x0F,
    }
}

fn clamp_dpi(val: u16) -> u16 {
    val.clamp(200, 12000)
}

pub fn encode_set_config(cfg: &MouseConfig) -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 15;
    pkt[3] = 174;
    pkt[4] = 10;
    pkt[5] = 47;
    pkt[6] = 1;
    pkt[7] = 1;
    pkt[8] = 0;
    pkt[9] = 0;
    pkt[10] = cfg.light_mode;
    pkt[11] = cfg.report_rate.saturating_add(1);
    pkt[12] = cfg.dpi_count.clamp(1, 6);
    pkt[13] = cfg.dpi_index.min(5).saturating_add(1);

    let dpis = [
        clamp_dpi(cfg.dpi1_value),
        clamp_dpi(cfg.dpi2_value),
        clamp_dpi(cfg.dpi3_value),
        clamp_dpi(cfg.dpi4_value),
        clamp_dpi(cfg.dpi5_value),
        clamp_dpi(cfg.dpi6_value),
    ];
    for (i, dpi) in dpis.iter().enumerate() {
        let [lo, hi] = dpi.to_le_bytes();
        pkt[14 + i * 2] = lo;
        pkt[15 + i * 2] = hi;
    }

    pkt[49] = cfg.scroll_flag;
    pkt[50] = cfg.lod_value.clamp(1, 2);
    pkt[51] = cfg.sensor_flag;
    pkt[52] = cfg.key_respond.clamp(1, 30);
    pkt[53] = cfg.sleep_light;
    pkt[54] = cfg.highspeed_mode;
    pkt[55] = ((cfg.wakeup_flag & 0x0F) << 4) | (cfg.move_light_flag & 0x0F);
    pkt
}

pub fn encode_set_light_mode(mode: u8) -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 33;
    pkt[3] = 0;
    pkt[4] = 0;
    pkt[5] = 3;
    pkt[11] = mode;
    pkt
}

pub fn encode_get_keys() -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 8;
    pkt[3] = 165;
    pkt[4] = 11;
    pkt[5] = 32;
    pkt
}

pub fn decode_keys(raw_resp: &[u8]) -> Vec<ButtonAssignment> {
    let resp = normalize_hid_input_report(raw_resp);
    let defaults = default_buttons();
    if resp.len() < 8 + 6 * 4 {
        return defaults;
    }
    let slice = &resp[8..];
    let mut out = Vec::with_capacity(6);
    for i in 0..6 {
        let raw_type = slice[4 * i];
        let r#type = if raw_type == 64 { 16 } else { raw_type };
        let code1 = slice[4 * i + 1];
        let code2 = slice[4 * i + 2];
        let code3 = slice[4 * i + 3];
        if r#type == 0 || r#type == 255 {
            out.push(defaults[i].clone());
        } else {
            out.push(ButtonAssignment {
                index: i,
                name: button_label_from_codes(r#type, code1, code2, code3),
                r#type,
                code1,
                code2,
                code3,
            });
        }
    }
    out
}

pub fn encode_reset_keys() -> [u8; PACKET_LEN] {
    let mut pkt = [0u8; PACKET_LEN];
    pkt[0] = 0;
    pkt[1] = 85;
    pkt[2] = 9;
    pkt[3] = 165;
    pkt[4] = 34;
    pkt[5] = 32;
    pkt[6] = 0;
    pkt[7] = 0;
    pkt[8] = 0;
    pkt[9] = 32;
    pkt[10] = 1;
    pkt[11] = 0;
    pkt[12] = 0;
    pkt[13] = 32;
    pkt[14] = 2;
    pkt[15] = 0;
    pkt[16] = 0;
    pkt[17] = 32;
    pkt[18] = 4;
    pkt[19] = 0;
    pkt[20] = 0;
    pkt[21] = 32;
    pkt[22] = 8;
    pkt[23] = 0;
    pkt[24] = 0;
    pkt[25] = 32;
    pkt[26] = 16;
    pkt[27] = 0;
    pkt[28] = 0;
    pkt[29] = 33;
    pkt[30] = 85;
    pkt[31] = 0;
    pkt[32] = 0;
    pkt[33] = 33;
    pkt[34] = 56;
    pkt[35] = 1;
    pkt[36] = 0;
    pkt[37] = 33;
    pkt[38] = 56;
    pkt[39] = 255;
    pkt[40] = 0;
    pkt
}

pub fn encode_set_keys(keys: &[ButtonAssignment]) -> [u8; PACKET_LEN] {
    let mut pkt = encode_reset_keys();
    for (n, key) in keys.iter().take(6).enumerate() {
        if n == 0 && key.r#type == 32 && key.code1 == 0 {
            continue;
        }
        let safe_type = if key.r#type == 64 { 16 } else { key.r#type };
        let base = 9 + 4 * n;
        pkt[base] = safe_type;
        pkt[base + 1] = key.code1;
        pkt[base + 2] = key.code2;
        pkt[base + 3] = key.code3;
    }
    pkt
}

pub fn decode_async_event(report: &[u8]) -> Option<AsyncMouseEvent> {
    let slice = normalize_hid_input_report(report);
    if slice.len() < 11 {
        return None;
    }
    if slice[0] == 170 && slice[1] == 250 {
        if slice[8] == 208 {
            return Some(AsyncMouseEvent::Battery {
                battery: slice[9],
                charge_flag: slice[10],
            });
        } else {
            return Some(AsyncMouseEvent::Status {
                dpi_index: slice[9].saturating_sub(1),
                report_rate: slice[10].saturating_sub(1),
            });
        }
    }
    if slice[0] == 170 && slice[1] == 237 {
        return Some(AsyncMouseEvent::Online {
            online: slice[8] == 2,
        });
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_encode_decode_with_non_ascii_fallback() {
        let pkt = encode_get_version();
        assert_eq!(pkt[0], 0);
        assert_eq!(pkt[1], 85);
        assert_eq!(pkt[2], 3);

        let mut resp = [0u8; 65];
        resp[23] = b'1';
        resp[24] = b'0';
        resp[25] = b'4';
        assert_eq!(decode_version(&resp), "1.0.4");

        let bad_resp = [0xFFu8; 65];
        assert_eq!(decode_version(&bad_resp), "0.0.0");
    }

    #[test]
    fn test_online_and_battery_commands() {
        let online_pkt = encode_get_online();
        assert_eq!(&online_pkt[0..6], &[0, 85, 237, 0, 1, 46]);
        let mut resp = [0u8; 65];
        resp[8] = 2;
        assert!(decode_online(&resp));
        resp[8] = 0;
        assert!(!decode_online(&resp));

        let bat_pkt = encode_get_battery();
        assert_eq!(&bat_pkt[0..8], &[0, 85, 48, 165, 11, 46, 1, 1]);
        let mut bat_resp = [0u8; 65];
        bat_resp[8] = 85;
        bat_resp[9] = 1;
        assert_eq!(
            decode_battery(&bat_resp),
            BatteryInfo {
                battery_value: 85,
                charge_flag: 1
            }
        );

        let mut win_bat_resp = [0u8; 65];
        win_bat_resp[0] = 0;
        win_bat_resp[1] = 170;
        win_bat_resp[9] = 75;
        win_bat_resp[10] = 0;
        assert_eq!(
            decode_battery(&win_bat_resp),
            BatteryInfo {
                battery_value: 75,
                charge_flag: 0
            }
        );
    }

    #[test]
    fn test_config_roundtrip_and_uninitialized_fallback() {
        let get_pkt = encode_get_config();
        assert_eq!(&get_pkt[0..8], &[0, 85, 14, 165, 11, 47, 1, 1]);

        let zero_resp = [0u8; 65];
        assert_eq!(decode_config(&zero_resp), MouseConfig::default());
        let ff_resp = [255u8; 65];
        assert_eq!(decode_config(&ff_resp), MouseConfig::default());

        let custom = MouseConfig {
            light_mode: 4,
            report_rate: 2,
            dpi_index: 1,
            dpi_flag: 6,
            dpi_count: 6,
            dpi1_value: 400,
            dpi2_value: 800,
            dpi3_value: 1600,
            dpi4_value: 2400,
            dpi5_value: 4800,
            dpi6_value: 9600,
            scroll_flag: 1,
            lod_value: 2,
            sensor_flag: SENSOR_FLAG_RIPPLE_CONTROL | SENSOR_FLAG_MOTION_SYNC,
            key_respond: 4,
            sleep_light: 20,
            highspeed_mode: 1,
            wakeup_flag: 1,
            move_light_flag: 0,
        };
        let encoded = encode_set_config(&custom);
        assert_eq!(&encoded[0..8], &[0, 85, 15, 174, 10, 47, 1, 1]);
        assert_eq!(encoded[10], 4);
        assert_eq!(encoded[11], 3);
        assert_eq!(encoded[12], 6);
        assert_eq!(encoded[13], 2);
        assert_eq!(u16::from_le_bytes([encoded[14], encoded[15]]), 400);
        assert_eq!(u16::from_le_bytes([encoded[24], encoded[25]]), 9600);
        assert_eq!(encoded[49], 1);
        assert_eq!(encoded[50], 2);
        assert_eq!(encoded[51], 33);
        assert_eq!(encoded[52], 4);
        assert_eq!(encoded[53], 20);
        assert_eq!(encoded[54], 1);

        let mut read_resp = [0u8; 65];
        read_resp[9] = custom.light_mode;
        read_resp[10] = custom.report_rate + 1;
        read_resp[11] = custom.dpi_count;
        read_resp[12] = custom.dpi_index + 1;
        read_resp[13..25].copy_from_slice(&encoded[14..26]);
        read_resp[48] = custom.scroll_flag;
        read_resp[49] = custom.lod_value;
        read_resp[50] = custom.sensor_flag;
        read_resp[51] = custom.key_respond;
        read_resp[52] = custom.sleep_light;
        read_resp[53] = custom.highspeed_mode;
        read_resp[55] = (custom.move_light_flag << 4) | (custom.wakeup_flag & 0x0F);

        let decoded = decode_config(&read_resp);
        assert_eq!(decoded, custom);
    }

    #[test]
    fn test_config_clamps_out_of_range_dpi() {
        let mut cfg = MouseConfig::default();
        cfg.dpi1_value = 50;
        cfg.dpi6_value = 25000;
        let encoded = encode_set_config(&cfg);
        assert_eq!(u16::from_le_bytes([encoded[14], encoded[15]]), 200);
        assert_eq!(u16::from_le_bytes([encoded[24], encoded[25]]), 12000);
    }

    #[test]
    fn test_set_keys_and_reset_keys_exact_bytes() {
        let reset = encode_reset_keys();
        assert_eq!(&reset[0..9], &[0, 85, 9, 165, 34, 32, 0, 0, 0]);
        assert_eq!(&reset[9..13], &[32, 1, 0, 0]);
        assert_eq!(&reset[13..17], &[32, 2, 0, 0]);
        assert_eq!(&reset[17..21], &[32, 4, 0, 0]);
        assert_eq!(&reset[21..25], &[32, 8, 0, 0]);
        assert_eq!(&reset[25..29], &[32, 16, 0, 0]);
        assert_eq!(&reset[29..33], &[33, 85, 0, 0]);
        assert_eq!(&reset[33..37], &[33, 56, 1, 0]);
        assert_eq!(&reset[37..41], &[33, 56, 255, 0]);

        let mut custom_keys = default_buttons();
        assert_eq!(custom_keys.len(), 6);
        custom_keys[3].r#type = 48;
        custom_keys[3].code1 = 233;
        custom_keys[3].code2 = 0;
        custom_keys[3].code3 = 0;
        let pkt = encode_set_keys(&custom_keys);
        assert_eq!(&pkt[21..25], &[48, 233, 0, 0]);
        assert_eq!(&pkt[9..13], &[32, 1, 0, 0]);
    }

    #[test]
    fn test_async_event_parsing() {
        let mut bat_evt = [0u8; 64];
        bat_evt[0] = 170;
        bat_evt[1] = 250;
        bat_evt[8] = 208;
        bat_evt[9] = 92;
        bat_evt[10] = 1;
        assert_eq!(
            decode_async_event(&bat_evt),
            Some(AsyncMouseEvent::Battery {
                battery: 92,
                charge_flag: 1
            })
        );

        let mut status_evt = [0u8; 64];
        status_evt[0] = 170;
        status_evt[1] = 250;
        status_evt[8] = 1;
        status_evt[9] = 4;
        status_evt[10] = 4;
        assert_eq!(
            decode_async_event(&status_evt),
            Some(AsyncMouseEvent::Status {
                dpi_index: 3,
                report_rate: 3
            })
        );

        let mut online_evt = [0u8; 64];
        online_evt[0] = 170;
        online_evt[1] = 237;
        online_evt[8] = 2;
        assert_eq!(
            decode_async_event(&online_evt),
            Some(AsyncMouseEvent::Online { online: true })
        );
    }
}
