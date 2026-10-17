export interface BatteryInfo {
  battery_value: number;
  charge_flag: number;
}

export interface ButtonAssignment {
  index: number;
  name: string;
  type: number;
  code1: number;
  code2: number;
  code3: number;
}

export interface MouseConfig {
  light_mode: number;
  report_rate: number;
  dpi_index: number;
  dpi_flag: number;
  dpi_count: number;
  dpi1_value: number;
  dpi2_value: number;
  dpi3_value: number;
  dpi4_value: number;
  dpi5_value: number;
  dpi6_value: number;
  scroll_flag: number;
  lod_value: number;
  sensor_flag: number;
  key_respond: number;
  sleep_light: number;
  highspeed_mode: number;
  wakeup_flag: number;
  move_light_flag: number;
}

export interface FullMouseState {
  connected: boolean;
  demo_mode: boolean;
  connect_mode: string;
  online: boolean;
  firmware_version: string;
  battery: BatteryInfo;
  config: MouseConfig;
  buttons: ButtonAssignment[];
}

export interface MouseBackupEntry {
  id: string;
  schema_version: number;
  name: string;
  created_at: string;
  firmware_version: string | null;
  config: MouseConfig;
  buttons: ButtonAssignment[];
}
