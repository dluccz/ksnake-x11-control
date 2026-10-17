export const SENSOR_FLAG_RIPPLE_CONTROL = 1;
export const SENSOR_FLAG_LINEAR_CORRECTION = 16;
export const SENSOR_FLAG_MOTION_SYNC = 32;

export const DPI_STAGE_COLORS = [
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#06b6d4",
  "#a855f7",
];

export const REPORT_RATE_OPTIONS = [
  { index: 0, hz: 125, label: "125 Hz (Economia)" },
  { index: 1, hz: 250, label: "250 Hz (Padrao)" },
  { index: 2, hz: 500, label: "500 Hz (Gamer)" },
  { index: 3, hz: 1000, label: "1000 Hz (Ultra Rapido)" },
];

export const SLEEP_TIME_OPTIONS = [
  { value: 1, label: "1 Minuto" },
  { value: 3, label: "3 Minutos" },
  { value: 5, label: "5 Minutos" },
  { value: 10, label: "10 Minutos" },
  { value: 20, label: "20 Minutos" },
  { value: 30, label: "30 Minutos" },
  { value: 60, label: "60 Minutos" },
];

export const LIGHT_MODE_OPTIONS = [
  { value: 0, name: "Desligado", description: "Desativa os LEDs para maxima duracao de bateria" },
  { value: 1, name: "Onda (Wave)", description: "Transicao fluida continua entre cores RGB" },
  { value: 2, name: "Neon", description: "Alternancia suave de espectro completo" },
  { value: 3, name: "Flash Ciclico", description: "Pulsos luminosos ciclicos dinamicos" },
  { value: 4, name: "YOYO Ball", description: "Efeito de oscilacao luminosa bidirecional" },
  { value: 5, name: "Flash Unico", description: "Iluminacao reativa em pulso simples" },
  { value: 6, name: "Respiracao em Loop", description: "Ciclo de respiracao suave multicolorido" },
];

export interface PredefinedKeyAction {
  name: string;
  type: number;
  code1: number;
  code2: number;
  code3: number;
}

export const MOUSE_ACTIONS: PredefinedKeyAction[] = [
  { name: "Botão Esquerdo", type: 32, code1: 1, code2: 0, code3: 0 },
  { name: "Botão Direito", type: 32, code1: 2, code2: 0, code3: 0 },
  { name: "Botão do Meio", type: 32, code1: 4, code2: 0, code3: 0 },
  { name: "Voltar", type: 32, code1: 8, code2: 0, code3: 0 },
  { name: "Avançar", type: 32, code1: 16, code2: 0, code3: 0 },
  { name: "Scroll para Cima", type: 33, code1: 56, code2: 1, code3: 0 },
  { name: "Scroll para Baixo", type: 33, code1: 56, code2: 255, code3: 0 },
  { name: "Ciclo de DPI", type: 33, code1: 85, code2: 0, code3: 0 },
  { name: "Desativado", type: 32, code1: 0, code2: 0, code3: 0 },
];

export const MEDIA_ACTIONS: PredefinedKeyAction[] = [
  { name: "Volume +", type: 48, code1: 233, code2: 0, code3: 0 },
  { name: "Volume -", type: 48, code1: 234, code2: 0, code3: 0 },
  { name: "Mudo", type: 48, code1: 226, code2: 0, code3: 0 },
  { name: "Play/Pause", type: 48, code1: 205, code2: 0, code3: 0 },
  { name: "Parar Midia", type: 48, code1: 183, code2: 0, code3: 0 },
  { name: "Faixa Anterior", type: 48, code1: 182, code2: 0, code3: 0 },
  { name: "Proxima Faixa", type: 48, code1: 181, code2: 0, code3: 0 },
  { name: "Multimidia", type: 48, code1: 131, code2: 1, code3: 0 },
  { name: "Pagina Inicial", type: 48, code1: 35, code2: 2, code3: 0 },
  { name: "Atualizar Pagina", type: 48, code1: 39, code2: 2, code3: 0 },
  { name: "Parar Carregamento", type: 48, code1: 38, code2: 2, code3: 0 },
  { name: "Avancar Pagina", type: 48, code1: 37, code2: 2, code3: 0 },
  { name: "Voltar Pagina", type: 48, code1: 36, code2: 2, code3: 0 },
  { name: "Favoritos", type: 48, code1: 42, code2: 2, code3: 0 },
  { name: "Pesquisar", type: 48, code1: 33, code2: 2, code3: 0 },
  { name: "Calculadora", type: 48, code1: 146, code2: 1, code3: 0 },
  { name: "Meu Computador", type: 48, code1: 148, code2: 1, code3: 0 },
  { name: "E-mail", type: 48, code1: 138, code2: 1, code3: 0 },
];

export interface HidKeyOption {
  label: string;
  hidCode: number;
}

export const KEYBOARD_HID_KEYS: HidKeyOption[] = [
  { label: "A", hidCode: 4 },
  { label: "B", hidCode: 5 },
  { label: "C", hidCode: 6 },
  { label: "D", hidCode: 7 },
  { label: "E", hidCode: 8 },
  { label: "F", hidCode: 9 },
  { label: "G", hidCode: 10 },
  { label: "H", hidCode: 11 },
  { label: "I", hidCode: 12 },
  { label: "J", hidCode: 13 },
  { label: "K", hidCode: 14 },
  { label: "L", hidCode: 15 },
  { label: "M", hidCode: 16 },
  { label: "N", hidCode: 17 },
  { label: "O", hidCode: 18 },
  { label: "P", hidCode: 19 },
  { label: "Q", hidCode: 20 },
  { label: "R", hidCode: 21 },
  { label: "S", hidCode: 22 },
  { label: "T", hidCode: 23 },
  { label: "U", hidCode: 24 },
  { label: "V", hidCode: 25 },
  { label: "W", hidCode: 26 },
  { label: "X", hidCode: 27 },
  { label: "Y", hidCode: 28 },
  { label: "Z", hidCode: 29 },
  { label: "1", hidCode: 30 },
  { label: "2", hidCode: 31 },
  { label: "3", hidCode: 32 },
  { label: "4", hidCode: 33 },
  { label: "5", hidCode: 34 },
  { label: "6", hidCode: 35 },
  { label: "7", hidCode: 36 },
  { label: "8", hidCode: 37 },
  { label: "9", hidCode: 38 },
  { label: "0", hidCode: 39 },
  { label: "Enter", hidCode: 40 },
  { label: "Esc", hidCode: 41 },
  { label: "Backspace", hidCode: 42 },
  { label: "Tab", hidCode: 43 },
  { label: "Espaço", hidCode: 44 },
  { label: "CapsLock", hidCode: 57 },
  { label: "F1", hidCode: 58 },
  { label: "F2", hidCode: 59 },
  { label: "F3", hidCode: 60 },
  { label: "F4", hidCode: 61 },
  { label: "F5", hidCode: 62 },
  { label: "F6", hidCode: 63 },
  { label: "F7", hidCode: 64 },
  { label: "F8", hidCode: 65 },
  { label: "F9", hidCode: 66 },
  { label: "F10", hidCode: 67 },
  { label: "F11", hidCode: 68 },
  { label: "F12", hidCode: 69 },
  { label: "PrintScreen", hidCode: 70 },
  { label: "Insert", hidCode: 73 },
  { label: "Home", hidCode: 74 },
  { label: "PageUp", hidCode: 75 },
  { label: "Delete", hidCode: 76 },
  { label: "End", hidCode: 77 },
  { label: "PageDown", hidCode: 78 },
  { label: "Seta Direita", hidCode: 79 },
  { label: "Seta Esquerda", hidCode: 80 },
  { label: "Seta Baixo", hidCode: 81 },
  { label: "Seta Cima", hidCode: 82 },
];

export const BUTTON_POSITIONS = [
  "Botão 1 (Clique Esquerdo Principal)",
  "Botão 2 (Clique Direito)",
  "Botão 3 (Meio / Roda do Scroll)",
  "Botão 4 (Lateral Voltar)",
  "Botão 5 (Lateral Avançar)",
  "Botão 6 (Botão Superior de DPI)",
];
