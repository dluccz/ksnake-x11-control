export type Locale = "pt" | "en";

export interface Translations {
  appBrandName: string;
  developedBy: string;
  devices: string;
  profilesAndBackups: string;
  yourDevices: string;
  connectUsb: string;
  simulationMode: string;
  syncingHid: string;
  ready: string;
  simulation: string;
  connected: string;
  chargingShort: string;
  factoryReset: string;
  confirmReset: string;
  cancel: string;
  tabOverview: string;
  tabPerformance: string;
  tabButtons: string;
  tabAdvanced: string;
  tabBackups: string;
  sensitivity: string;
  stagesBadge: string;
  stagesInUse: string;
  enableDisableStage: string;
  activateStage: string;
  reportFrequency: string;
  buttonLabel: string;
  reset: string;
  catMouse: string;
  catMedia: string;
  catKeyboard: string;
  pressKey: string;
  captureKey: string;
  applyShortcut: string;
  sensorProcessing: string;
  motionSyncTitle: string;
  motionSyncDesc: string;
  rippleControlTitle: string;
  rippleControlDesc: string;
  angleSnappingTitle: string;
  angleSnappingDesc: string;
  hardwareTuning: string;
  lodTitle: string;
  debounceTitle: string;
  scrollDirectionTitle: string;
  scrollStandard: string;
  scrollReverse: string;
  rgbLighting: string;
  turnOffLedMovingTitle: string;
  turnOffLedMovingDesc: string;
  powerManagement: string;
  wakeOnMoveTitle: string;
  wakeOnMoveDesc: string;
  activeSensitivity: string;
  stageOf: (cur: number, total: number) => string;
  pollingRate: string;
  intervalMs: (ms: number) => string;
  hardwareDsp: string;
  motionSyncState: (on: boolean) => string;
  profilesTitle: string;
  profilePlaceholder: string;
  saveCurrent: string;
  importJson: string;
  noProfiles: string;
  apply: string;
  exportBtn: string;
  deleteBtn: string;
  toastSimulationActive: string;
  toastConnectedVia: (mode: string) => string;
  toastFactoryRestored: string;
  toastButtonsReset: string;
  toastBtn1Locked: string;
  toastAssigned: (name: string) => string;
  toastProfileSaved: (name: string) => string;
  toastProfileApplied: (name: string) => string;
  toastProfileImported: (name: string) => string;
  shortBtnLabels: string[];
  lightModes: Record<number, string>;
  actionNames: Record<string, string>;
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  pt: {
    appBrandName: "Mouse Hub",
    developedBy: "Por dluccz",
    devices: "Dispositivos",
    profilesAndBackups: "Perfis e Backups",
    yourDevices: "Seus dispositivos",
    connectUsb: "Conectar USB / 2.4G",
    simulationMode: "Modo Simulação",
    syncingHid: "Sincronizando...",
    ready: "Pronto",
    simulation: "Simulação",
    connected: "Conectado",
    chargingShort: " (CARREGANDO)",
    factoryReset: "Padrão de Fábrica",
    confirmReset: "Confirmar Reset",
    cancel: "Cancelar",
    tabOverview: "Visão Geral",
    tabPerformance: "Desempenho",
    tabButtons: "Botões",
    tabAdvanced: "Avançado",
    tabBackups: "Backups",
    sensitivity: "Sensibilidade",
    stagesBadge: "Estágios",
    stagesInUse: "Estágios em uso",
    enableDisableStage: "Ativar/Desativar Estágio",
    activateStage: "Selecionar como Estágio Ativo",
    reportFrequency: "Taxa de Atualização (Polling Rate)",
    buttonLabel: "Botão",
    reset: "Restaurar",
    catMouse: "Mouse",
    catMedia: "Mídia",
    catKeyboard: "Teclado",
    pressKey: "Pressione...",
    captureKey: "Capturar Tecla",
    applyShortcut: "Aplicar Atalho",
    sensorProcessing: "Processamento do Sensor",
    motionSyncTitle: "Motion Sync",
    motionSyncDesc: "Sincroniza leituras do sensor com os pacotes USB",
    rippleControlTitle: "Ripple Control",
    rippleControlDesc: "Suaviza oscilações em níveis altos de DPI",
    angleSnappingTitle: "Correção Linear (Angle Snapping)",
    angleSnappingDesc: "Retifica movimentos quase retos em linhas perfeitas",
    hardwareTuning: "Ajustes de Hardware",
    lodTitle: "Altura de Corte (LOD)",
    debounceTitle: "Tempo de Resposta do Clique (Debounce)",
    scrollDirectionTitle: "Direção da Roda de Scroll",
    scrollStandard: "Normal",
    scrollReverse: "Invertido",
    rgbLighting: "Iluminação RGB",
    turnOffLedMovingTitle: "Apagar LED ao Mover",
    turnOffLedMovingDesc: "Economiza bateria enquanto o mouse está em movimento",
    powerManagement: "Energia e Suspensão",
    wakeOnMoveTitle: "Acordar ao Mover",
    wakeOnMoveDesc: "Sai da suspensão apenas movendo o mouse",
    activeSensitivity: "Sensibilidade Ativa",
    stageOf: (cur, total) => `Estágio ${cur} de ${total}`,
    pollingRate: "Frequência de Resposta",
    intervalMs: (ms) => `Intervalo de ${ms} ms`,
    hardwareDsp: "Sensor e Latência",
    motionSyncState: (on) => `Motion Sync ${on ? "ATIVADO" : "DESATIVADO"}`,
    profilesTitle: "Perfis e Snapshots",
    profilePlaceholder: "Nome do perfil...",
    saveCurrent: "Salvar Atual",
    importJson: "Importar JSON",
    noProfiles: "Nenhum perfil salvo ainda.",
    apply: "Aplicar",
    exportBtn: "Exportar",
    deleteBtn: "Excluir",
    toastSimulationActive: "Modo Simulação ativado",
    toastConnectedVia: (mode) => `Conectado via ${mode}`,
    toastFactoryRestored: "Configurações de fábrica restauradas",
    toastButtonsReset: "Botões restaurados para o padrão",
    toastBtn1Locked: "O Botão 1 (Clique Esquerdo) é bloqueado pelo firmware",
    toastAssigned: (name) => `Atribuído: ${name}`,
    toastProfileSaved: (name) => `Perfil "${name}" salvo`,
    toastProfileApplied: (name) => `Perfil "${name}" aplicado ao mouse`,
    toastProfileImported: (name) => `Perfil "${name}" importado e aplicado`,
    shortBtnLabels: [
      "Clique Esquerdo",
      "Clique Direito",
      "Botão do Meio",
      "Lateral Voltar",
      "Lateral Avançar",
      "Ciclo de DPI",
    ],
    lightModes: {
      0: "Desligado",
      1: "Onda (Wave)",
      2: "Neon",
      3: "Flash Cíclico",
      4: "YOYO Ball",
      5: "Flash Único",
      6: "Respiração",
    },
    actionNames: {
      "Botão Esquerdo": "Botão Esquerdo",
      "Botão Direito": "Botão Direito",
      "Botão do Meio": "Botão do Meio",
      "Voltar": "Voltar",
      "Avançar": "Avançar",
      "Scroll para Cima": "Scroll para Cima",
      "Scroll para Baixo": "Scroll para Baixo",
      "Ciclo de DPI": "Ciclo de DPI",
      "Desativado": "Desativado",
      "Volume +": "Volume +",
      "Volume -": "Volume -",
      "Mudo": "Mudo",
      "Play/Pause": "Play/Pause",
      "Parar Midia": "Parar Mídia",
      "Faixa Anterior": "Faixa Anterior",
      "Proxima Faixa": "Próxima Faixa",
      "Multimidia": "Reprodutor de Mídia",
      "Pagina Inicial": "Página Inicial",
      "Atualizar Pagina": "Atualizar Página",
      "Parar Carregamento": "Parar Carregamento",
      "Avancar Pagina": "Avançar Página",
      "Voltar Pagina": "Voltar Página",
      "Favoritos": "Favoritos",
      "Pesquisar": "Pesquisar",
      "Calculadora": "Calculadora",
      "Meu Computador": "Meu Computador",
      "E-mail": "E-mail",
      "Left Button": "Botão Esquerdo",
      "Right Button": "Botão Direito",
      "Middle Button": "Botão do Meio",
      "Back": "Voltar",
      "Forward": "Avançar",
      "DPI Loop": "Ciclo de DPI",
    },
  },
  en: {
    appBrandName: "Mouse Hub",
    developedBy: "By dluccz",
    devices: "Devices",
    profilesAndBackups: "Profiles & Backups",
    yourDevices: "Your devices",
    connectUsb: "Connect USB / 2.4G",
    simulationMode: "Simulation Mode",
    syncingHid: "Syncing HID...",
    ready: "Ready",
    simulation: "Simulation",
    connected: "Connected",
    chargingShort: " (CHG)",
    factoryReset: "Factory Reset",
    confirmReset: "Confirm Reset",
    cancel: "Cancel",
    tabOverview: "Overview",
    tabPerformance: "Performance",
    tabButtons: "Buttons",
    tabAdvanced: "Advanced",
    tabBackups: "Backups",
    sensitivity: "Sensitivity",
    stagesBadge: "Stages",
    stagesInUse: "Stages in use",
    enableDisableStage: "Enable/Disable Stage",
    activateStage: "Set as Active Stage",
    reportFrequency: "Report frequency",
    buttonLabel: "Button",
    reset: "Reset",
    catMouse: "Mouse",
    catMedia: "Media",
    catKeyboard: "Keyboard",
    pressKey: "Press Key...",
    captureKey: "Capture Key",
    applyShortcut: "Apply Shortcut",
    sensorProcessing: "Sensor Processing",
    motionSyncTitle: "Motion Sync",
    motionSyncDesc: "Synchronize SPI reads with USB polling",
    rippleControlTitle: "Ripple Control",
    rippleControlDesc: "High-DPI jitter smoothing",
    angleSnappingTitle: "Angle Snapping",
    angleSnappingDesc: "Linear path correction",
    hardwareTuning: "Hardware Tuning",
    lodTitle: "Lift-Off Distance (LOD)",
    debounceTitle: "Click Debounce",
    scrollDirectionTitle: "Scroll Wheel Direction",
    scrollStandard: "Standard",
    scrollReverse: "Reverse",
    rgbLighting: "RGB Lighting",
    turnOffLedMovingTitle: "Turn Off LED While Moving",
    turnOffLedMovingDesc: "Saves battery during active movement",
    powerManagement: "Power Management",
    wakeOnMoveTitle: "Wake on Mouse Movement",
    wakeOnMoveDesc: "Resume from deep sleep without clicking",
    activeSensitivity: "Active Sensitivity",
    stageOf: (cur, total) => `Stage ${cur} of ${total}`,
    pollingRate: "Polling Rate",
    intervalMs: (ms) => `${ms} ms interval`,
    hardwareDsp: "Hardware DSP",
    motionSyncState: (on) => `Motion Sync ${on ? "ON" : "OFF"}`,
    profilesTitle: "Profiles & Snapshots",
    profilePlaceholder: "Profile name...",
    saveCurrent: "Save Current",
    importJson: "Import JSON",
    noProfiles: "No saved profiles yet.",
    apply: "Apply",
    exportBtn: "Export",
    deleteBtn: "Delete",
    toastSimulationActive: "Simulation mode active",
    toastConnectedVia: (mode) => `Connected via ${mode}`,
    toastFactoryRestored: "Factory defaults restored",
    toastButtonsReset: "Buttons reset to default",
    toastBtn1Locked: "Button 1 (Left Click) is locked by firmware",
    toastAssigned: (name) => `Assigned: ${name}`,
    toastProfileSaved: (name) => `Saved "${name}"`,
    toastProfileApplied: (name) => `Applied "${name}"`,
    toastProfileImported: (name) => `Imported & applied "${name}"`,
    shortBtnLabels: [
      "Left Click",
      "Right Click",
      "Middle Click",
      "Side Back",
      "Side Forward",
      "DPI Cycle",
    ],
    lightModes: {
      0: "Off",
      1: "Wave",
      2: "Neon",
      3: "Cyclic Flash",
      4: "YOYO Ball",
      5: "Single Flash",
      6: "Breathing",
    },
    actionNames: {
      "Botão Esquerdo": "Left Click",
      "Botão Direito": "Right Click",
      "Botão do Meio": "Middle Click",
      "Voltar": "Back",
      "Avançar": "Forward",
      "Scroll para Cima": "Scroll Up",
      "Scroll para Baixo": "Scroll Down",
      "Ciclo de DPI": "DPI Cycle",
      "Desativado": "Disabled",
      "Volume +": "Volume +",
      "Volume -": "Volume -",
      "Mudo": "Mute",
      "Play/Pause": "Play/Pause",
      "Parar Midia": "Stop Media",
      "Faixa Anterior": "Previous Track",
      "Proxima Faixa": "Next Track",
      "Multimidia": "Media Player",
      "Pagina Inicial": "Home Page",
      "Atualizar Pagina": "Refresh Page",
      "Parar Carregamento": "Stop Loading",
      "Avancar Pagina": "Browser Forward",
      "Voltar Pagina": "Browser Back",
      "Favoritos": "Bookmarks",
      "Pesquisar": "Search",
      "Calculadora": "Calculator",
      "Meu Computador": "My Computer",
      "E-mail": "Mail",
      "Left Button": "Left Click",
      "Right Button": "Right Click",
      "Middle Button": "Middle Click",
      "Back": "Back",
      "Forward": "Forward",
      "DPI Loop": "DPI Cycle",
    },
  },
};
