import React, { useEffect, useRef, useState } from "react";
import {
  applyBackupToMouse,
  connectMouse,
  createBackup,
  deleteBackup,
  exportBackupJson,
  getFullMouseState,
  importBackupJson,
  listBackups,
  openExternalUrl,
  resetMouseButtons,
  restoreFactorySettings,
  saveMouseButtons,
  saveMouseConfig,
  setMouseLightMode,
  windowClose,
  windowMinimize,
  windowStartDrag,
  windowToggleMaximize,
} from "./api";
import { Locale, TRANSLATIONS } from "./i18n";
import {
  KEYBOARD_HID_KEYS,
  LIGHT_MODE_OPTIONS,
  MEDIA_ACTIONS,
  MOUSE_ACTIONS,
  PredefinedKeyAction,
  REPORT_RATE_OPTIONS,
  SENSOR_FLAG_LINEAR_CORRECTION,
  SENSOR_FLAG_MOTION_SYNC,
  SENSOR_FLAG_RIPPLE_CONTROL,
  SLEEP_TIME_OPTIONS,
} from "./keyCatalog";
import {
  ButtonAssignment,
  FullMouseState,
  MouseBackupEntry,
  MouseConfig,
} from "./types";

type ActiveTab = "overview" | "performance" | "buttons" | "advanced" | "backups";
type KeyAssignTab = "mouse" | "media" | "keyboard";

const BROWSER_CODE_TO_HID: Record<string, number> = {
  KeyA: 4, KeyB: 5, KeyC: 6, KeyD: 7, KeyE: 8, KeyF: 9, KeyG: 10, KeyH: 11,
  KeyI: 12, KeyJ: 13, KeyK: 14, KeyL: 15, KeyM: 16, KeyN: 17, KeyO: 18, KeyP: 19,
  KeyQ: 20, KeyR: 21, KeyS: 22, KeyT: 23, KeyU: 24, KeyV: 25, KeyW: 26, KeyX: 27,
  KeyY: 28, KeyZ: 29, Digit1: 30, Digit2: 31, Digit3: 32, Digit4: 33, Digit5: 34,
  Digit6: 35, Digit7: 36, Digit8: 37, Digit9: 38, Digit0: 39, Enter: 40, Escape: 41,
  Backspace: 42, Tab: 43, Space: 44, CapsLock: 57, F1: 58, F2: 59, F3: 60, F4: 61,
  F5: 62, F6: 63, F7: 64, F8: 65, F9: 66, F10: 67, F11: 68, F12: 69,
  PrintScreen: 70, Insert: 73, Home: 74, PageUp: 75, Delete: 76, End: 77,
  PageDown: 78, ArrowRight: 79, ArrowLeft: 80, ArrowDown: 81, ArrowUp: 82,
};

export function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("ksnake_locale");
    return saved === "en" ? "en" : "pt";
  });

  const t = TRANSLATIONS[locale];

  const changeLocale = (next: Locale) => {
    setLocale(next);
    localStorage.setItem("ksnake_locale", next);
  };

  const translateActionName = (rawName: string): string => {
    return t.actionNames[rawName] ?? rawName;
  };

  const [mouseState, setMouseState] = useState<FullMouseState | null>(null);
  const [config, setConfig] = useState<MouseConfig | null>(null);
  const [buttons, setButtons] = useState<ButtonAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("performance");
  const [selectedBtnIndex, setSelectedBtnIndex] = useState<number>(3);
  const [keyAssignTab, setKeyAssignTab] = useState<KeyAssignTab>("mouse");

  const [modCtrl, setModCtrl] = useState(false);
  const [modShift, setModShift] = useState(false);
  const [modAlt, setModAlt] = useState(false);
  const [modWin, setModWin] = useState(false);
  const [selectedHidKey, setSelectedHidKey] = useState<number>(4);
  const [listeningKey, setListeningKey] = useState<boolean>(false);

  const [backups, setBackups] = useState<MouseBackupEntry[]>([]);
  const [newBackupName, setNewBackupName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const saveTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  };

  const applyFullState = (st: FullMouseState) => {
    setMouseState(st);
    setConfig({ ...st.config });
    setButtons(st.buttons.map((b) => ({ ...b })));
  };

  const commitConfigOptimistic = (nextCfg: MouseConfig, immediate = false) => {
    setConfig(nextCfg);
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    const runSave = async () => {
      setSyncing(true);
      try {
        const st = await saveMouseConfig(nextCfg);
        setMouseState(st);
      } catch (err) {
        showToast(String(err), true);
      } finally {
        setSyncing(false);
      }
    };
    if (immediate) {
      runSave();
    } else {
      saveTimerRef.current = window.setTimeout(runSave, 90);
    }
  };

  const handleConnect = async (demo: boolean) => {
    setSyncing(true);
    try {
      const st = await connectMouse(demo);
      applyFullState(st);
      showToast(demo ? t.toastSimulationActive : t.toastConnectedVia(st.connect_mode));
    } catch (err) {
      showToast(String(err), true);
    } finally {
      setSyncing(false);
    }
  };

  const refreshBackups = async () => {
    try {
      const list = await listBackups();
      setBackups(list);
    } catch (err) {
      showToast(String(err), true);
    }
  };

  useEffect(() => {
    refreshBackups();
    (async () => {
      try {
        const st = await connectMouse(false);
        applyFullState(st);
      } catch {
        const demoSt = await connectMouse(true);
        applyFullState(demoSt);
      }
    })();

    const pollInterval = window.setInterval(async () => {
      try {
        const st = await getFullMouseState();
        setMouseState((prev) =>
          prev
            ? {
                ...prev,
                battery: st.battery,
                online: st.online,
              }
            : st
        );
      } catch {
        // Ignore background poll errors
      }
    }, 8000);

    return () => window.clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (!listeningKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const hid = BROWSER_CODE_TO_HID[e.code];
      if (hid) {
        setSelectedHidKey(hid);
        setModCtrl(e.ctrlKey);
        setModShift(e.shiftKey);
        setModAlt(e.altKey);
        setModWin(e.metaKey);
        setListeningKey(false);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [listeningKey]);

  if (!mouseState || !config) {
    return <div className="om-window" />;
  }

  const dpiStages = [
    config.dpi1_value,
    config.dpi2_value,
    config.dpi3_value,
    config.dpi4_value,
    config.dpi5_value,
    config.dpi6_value,
  ];

  const activeDpiIndex = Math.min(config.dpi_index, Math.max(0, config.dpi_count - 1));
  const currentDpiValue = dpiStages[activeDpiIndex] ?? config.dpi1_value;
  const currentHzObj =
    REPORT_RATE_OPTIONS.find((r) => r.index === config.report_rate) ??
    REPORT_RATE_OPTIONS[3];

  const updateDpiStage = (idx: number, raw: number, immediate = false) => {
    const val = Math.max(200, Math.min(12000, Math.round(raw / 100) * 100));
    const next: MouseConfig = { ...config, dpi_index: idx };
    if (idx === 0) next.dpi1_value = val;
    if (idx === 1) next.dpi2_value = val;
    if (idx === 2) next.dpi3_value = val;
    if (idx === 3) next.dpi4_value = val;
    if (idx === 4) next.dpi5_value = val;
    if (idx === 5) next.dpi6_value = val;
    commitConfigOptimistic(next, immediate);
  };

  const toggleStageEnabled = (idx: number) => {
    const stageNum = idx + 1;
    let nextCount = config.dpi_count;
    if (stageNum <= config.dpi_count && config.dpi_count > 1) {
      nextCount = Math.max(1, stageNum - 1);
    } else {
      nextCount = stageNum;
    }
    const nextIndex = Math.min(config.dpi_index, nextCount - 1);
    commitConfigOptimistic(
      { ...config, dpi_count: nextCount, dpi_index: nextIndex },
      true
    );
  };

  const toggleSensorBit = (bit: number) => {
    const hasBit = (config.sensor_flag & bit) !== 0;
    const nextFlag = hasBit ? config.sensor_flag & ~bit : config.sensor_flag | bit;
    commitConfigOptimistic({ ...config, sensor_flag: nextFlag }, true);
  };

  const handleLightSelect = async (mode: number) => {
    setConfig({ ...config, light_mode: mode });
    setSyncing(true);
    try {
      const st = await setMouseLightMode(mode);
      setMouseState(st);
    } catch (err) {
      showToast(String(err), true);
    } finally {
      setSyncing(false);
    }
  };

  const handleAssignAction = async (action: PredefinedKeyAction) => {
    if (selectedBtnIndex === 0) {
      showToast(t.toastBtn1Locked, true);
      return;
    }
    const nextBtns = buttons.map((b, i) =>
      i === selectedBtnIndex
        ? {
            index: i,
            name: action.name,
            type: action.type,
            code1: action.code1,
            code2: action.code2,
            code3: action.code3,
          }
        : b
    );
    setButtons(nextBtns);
    setSyncing(true);
    try {
      const st = await saveMouseButtons(nextBtns);
      setMouseState(st);
      showToast(t.toastAssigned(translateActionName(action.name)));
    } catch (err) {
      showToast(String(err), true);
    } finally {
      setSyncing(false);
    }
  };

  const handleAssignKeyCombo = async () => {
    if (selectedBtnIndex === 0) {
      showToast(t.toastBtn1Locked, true);
      return;
    }
    const modMask =
      (modCtrl ? 1 : 0) |
      (modShift ? 2 : 0) |
      (modAlt ? 4 : 0) |
      (modWin ? 8 : 0);
    const keyObj = KEYBOARD_HID_KEYS.find((k) => k.hidCode === selectedHidKey);
    const parts: string[] = [];
    if (modCtrl) parts.push("Ctrl");
    if (modShift) parts.push("Shift");
    if (modAlt) parts.push("Alt");
    if (modWin) parts.push("Win");
    if (keyObj) parts.push(keyObj.label);
    const label = parts.join(" + ") || "Key";

    const nextBtns = buttons.map((b, i) =>
      i === selectedBtnIndex
        ? {
            index: i,
            name: label,
            type: 64,
            code1: modMask,
            code2: selectedHidKey,
            code3: 0,
          }
        : b
    );
    setButtons(nextBtns);
    setSyncing(true);
    try {
      const st = await saveMouseButtons(nextBtns);
      setMouseState(st);
      showToast(t.toastAssigned(label));
    } catch (err) {
      showToast(String(err), true);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateProfile = async () => {
    const label =
      newBackupName.trim() ||
      `Perfil ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    try {
      const list = await createBackup(
        label,
        mouseState.firmware_version,
        config,
        buttons
      );
      setBackups(list);
      setNewBackupName("");
      showToast(t.toastProfileSaved(label));
    } catch (err) {
      showToast(String(err), true);
    }
  };

  const handleExportProfile = async (entry: MouseBackupEntry) => {
    try {
      const raw = await exportBackupJson(entry);
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ksnake-x11-${entry.name.toLowerCase().replace(/[^a-z0-9-_]+/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(String(err), true);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const entry = await importBackupJson(text, true);
      await refreshBackups();
      const st = await applyBackupToMouse(entry.config, entry.buttons);
      applyFullState(st);
      showToast(t.toastProfileImported(entry.name));
    } catch (err) {
      showToast(String(err), true);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="om-window">
      <header className="om-titlebar">
        <div
          className="om-titlebar-drag"
          onMouseDown={(e) => {
            if (e.button === 0 && e.detail === 1) {
              windowStartDrag();
            }
          }}
          onDoubleClick={() => windowToggleMaximize()}
        >
          <span className="om-titlebar-dot" />
          <span>K-Snake X11 Control Center</span>
        </div>

        <div className="om-titlebar-controls">
          <button
            type="button"
            className="om-win-btn"
            onClick={() => windowMinimize()}
            title="Minimize"
          >
            <svg width="11" height="11" viewBox="0 0 12 12">
              <rect x="2" y="5.5" width="8" height="1.2" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className="om-win-btn"
            onClick={() => windowToggleMaximize()}
            title="Maximize"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2.2" y="2.2" width="7.6" height="7.6" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            className="om-win-btn close"
            onClick={() => windowClose()}
            title="Close"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
              <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
              <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
            </svg>
          </button>
        </div>
      </header>

      <div className="om-shell">
        <aside className="om-sidebar">
          <div className="om-brand">
            <div className="om-brand-left">
              <div className="om-brand-logo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="6" y="2" width="12" height="20" rx="6" />
                  <line x1="12" y1="6" x2="12" y2="10" />
                </svg>
              </div>
              <div className="om-brand-name">{t.appBrandName}</div>
            </div>

            <div className="om-lang-switch">
              <button
                type="button"
                className={`om-lang-btn ${locale === "pt" ? "active" : ""}`}
                onClick={() => changeLocale("pt")}
              >
                PT
              </button>
              <button
                type="button"
                className={`om-lang-btn ${locale === "en" ? "active" : ""}`}
                onClick={() => changeLocale("en")}
              >
                EN
              </button>
            </div>
          </div>

          <div className="om-nav-group">
            <button
              className={`om-nav-item ${activeTab !== "backups" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="2" width="12" height="20" rx="6" />
                <path d="M12 6v4" />
              </svg>
              {t.devices}
            </button>
            <button
              className={`om-nav-item ${activeTab === "backups" ? "active" : ""}`}
              onClick={() => setActiveTab("backups")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
              </svg>
              {t.profilesAndBackups}
            </button>
          </div>

          <div>
            <div className="om-section-label">{t.yourDevices}</div>
            <div
              className="om-device-mini-card active"
              onClick={() => setActiveTab("performance")}
            >
              <div className="om-device-mini-thumb">
                <img src="/mouse.png" alt="K-Snake X11" />
              </div>
              <div className="om-device-mini-meta">
                <div className="om-device-mini-title">K-Snake X11</div>
                <div className="om-device-mini-sub">
                  <span className={`om-dot ${mouseState.demo_mode ? "demo" : ""}`} />
                  <span>{mouseState.battery.battery_value}%</span>
                  <span>•</span>
                  <span>{currentHzObj.hz} Hz</span>
                </div>
              </div>
            </div>
          </div>

          <div className="om-sidebar-footer">
            <button className="om-btn" onClick={() => handleConnect(false)}>
              {t.connectUsb}
            </button>
            <button className="om-btn" onClick={() => handleConnect(true)}>
              {t.simulationMode}
            </button>
            <div className="om-footer-status">
              <span>{syncing ? t.syncingHid : t.ready}</span>
              <span>FW {mouseState.firmware_version}</span>
            </div>

            <div className="om-credits-box">
              <span className="om-credits-title">{t.developedBy}</span>
              <div className="om-credits-links">
                <button
                  type="button"
                  className="om-credit-chip"
                  onClick={() => openExternalUrl("https://github.com/dluccz")}
                  title="https://github.com/dluccz"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  GitHub
                </button>
                <button
                  type="button"
                  className="om-credit-chip"
                  onClick={() => openExternalUrl("https://dluc.cz/")}
                  title="https://dluc.cz/"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  dluc.cz
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="om-main">
          <section className="om-hero-card">
            <div className="om-hero-top">
              <div className="om-hero-left">
                <div className="om-hero-visual">
                  <img src="/mouse.png" alt="K-Snake X11" />
                </div>
                <div className="om-hero-info">
                  <div className="om-breadcrumb">
                    <span>{t.devices}</span>
                    <span>/</span>
                    <span>K-Snake X11</span>
                  </div>
                  <div className="om-hero-title-row">
                    <h1 className="om-hero-title">K-Snake X11</h1>
                  </div>
                  <div className="om-hero-status-line">
                    <span className={`om-dot ${mouseState.demo_mode ? "demo" : ""}`} />
                    <span>
                      {mouseState.demo_mode ? t.simulation : t.connected} • K-Snake •{" "}
                      {mouseState.connect_mode}
                    </span>
                  </div>
                  <div className="om-telemetry-pills">
                    <span className="om-pill">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        <line x1="12" y1="20" x2="12.01" y2="20" />
                      </svg>
                      {mouseState.connect_mode}
                    </span>
                    <span className="om-pill">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="2" y="7" width="16" height="10" rx="2" />
                        <line x1="22" y1="11" x2="22" y2="13" />
                      </svg>
                      {mouseState.battery.battery_value}%
                      {mouseState.battery.charge_flag === 1 ? t.chargingShort : ""}
                    </span>
                    <span className="om-pill">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      {currentHzObj.hz.toLocaleString()} Hz
                    </span>
                    <span className="om-pill">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {currentDpiValue.toLocaleString()} DPI
                    </span>
                    <span className="om-pill">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      LOD {config.lod_value}.0mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="om-hero-actions">
                {!confirmReset ? (
                  <button className="om-btn" onClick={() => setConfirmReset(true)}>
                    {t.factoryReset}
                  </button>
                ) : (
                  <>
                    <button
                      className="om-btn danger"
                      onClick={async () => {
                        setConfirmReset(false);
                        const st = await restoreFactorySettings();
                        applyFullState(st);
                        showToast(t.toastFactoryRestored);
                      }}
                    >
                      {t.confirmReset}
                    </button>
                    <button className="om-btn" onClick={() => setConfirmReset(false)}>
                      {t.cancel}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="om-subnav">
              <div className="om-tabs">
                <button
                  className={`om-tab ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  {t.tabOverview}
                </button>
                <button
                  className={`om-tab ${activeTab === "performance" ? "active" : ""}`}
                  onClick={() => setActiveTab("performance")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  {t.tabPerformance}
                </button>
                <button
                  className={`om-tab ${activeTab === "buttons" ? "active" : ""}`}
                  onClick={() => setActiveTab("buttons")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="2" width="12" height="20" rx="6" />
                    <line x1="12" y1="6" x2="12" y2="10" />
                  </svg>
                  {t.tabButtons}
                </button>
                <button
                  className={`om-tab ${activeTab === "advanced" ? "active" : ""}`}
                  onClick={() => setActiveTab("advanced")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  {t.tabAdvanced}
                </button>
                <button
                  className={`om-tab ${activeTab === "backups" ? "active" : ""}`}
                  onClick={() => setActiveTab("backups")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                  {t.tabBackups} ({backups.length})
                </button>
              </div>
            </div>
          </section>

          {activeTab === "performance" && (
            <>
              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <span className="om-card-title">{t.sensitivity}</span>
                    <span className="om-badge-soft">{t.stagesBadge}</span>
                  </div>
                  <div className="om-card-readout">
                    {currentDpiValue.toLocaleString()} DPI
                  </div>
                </div>

                <div className="om-stages-meta">
                  <span>{t.stagesInUse}</span>
                  <span>{config.dpi_count} / 6</span>
                </div>

                <div className="om-stages-list">
                  {dpiStages.map((dpiVal, idx) => {
                    const enabled = idx < config.dpi_count;
                    const isCurrent = idx === activeDpiIndex;
                    const pct = ((dpiVal - 200) / (12000 - 200)) * 100;

                    return (
                      <div
                        key={idx}
                        className={`om-stage-row ${isCurrent ? "active-stage" : ""} ${
                          !enabled ? "disabled-stage" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className={`om-stage-check ${enabled ? "checked" : ""}`}
                          onClick={() => toggleStageEnabled(idx)}
                          title={t.enableDisableStage}
                        >
                          {enabled && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>

                        <button
                          type="button"
                          className={`om-stage-index ${isCurrent ? "current" : ""}`}
                          onClick={() =>
                            commitConfigOptimistic(
                              {
                                ...config,
                                dpi_count: Math.max(config.dpi_count, idx + 1),
                                dpi_index: idx,
                              },
                              true
                            )
                          }
                          title={t.activateStage}
                        >
                          {idx + 1}
                        </button>

                        <input
                          type="number"
                          min={200}
                          max={12000}
                          step={100}
                          value={dpiVal}
                          disabled={!enabled}
                          className="om-dpi-input"
                          onChange={(e) =>
                            updateDpiStage(idx, Number(e.target.value) || 200, false)
                          }
                        />

                        <div className="om-slider-wrap">
                          <input
                            type="range"
                            min={200}
                            max={12000}
                            step={100}
                            value={dpiVal}
                            disabled={!enabled}
                            className="om-slider"
                            style={{
                              background: `linear-gradient(90deg, #22c55e ${pct}%, #1c212b ${pct}%)`,
                            }}
                            onChange={(e) =>
                              updateDpiStage(idx, Number(e.target.value), false)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <span className="om-card-title">{t.reportFrequency}</span>
                  </div>
                  <div className="om-card-readout">
                    {currentHzObj.hz.toLocaleString()} Hz
                  </div>
                </div>

                <div className="om-hz-grid">
                  {REPORT_RATE_OPTIONS.map((opt, idx) => {
                    const active = config.report_rate === opt.index;
                    const barCount = idx + 1;
                    return (
                      <button
                        key={opt.index}
                        type="button"
                        className={`om-hz-card ${active ? "active" : ""}`}
                        onClick={() =>
                          commitConfigOptimistic(
                            { ...config, report_rate: opt.index },
                            true
                          )
                        }
                      >
                        <div className="om-hz-bars-box">
                          {Array.from({ length: barCount }).map((_, bIdx) => (
                            <span
                              key={bIdx}
                              className="om-hz-bar"
                              style={{ height: `${14 + bIdx * 8}px` }}
                            />
                          ))}
                        </div>
                        <span className="om-hz-label">{opt.hz} Hz</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === "buttons" && (
            <div className="om-buttons-layout">
              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4z" />
                        <rect x="5" y="8" width="14" height="14" rx="5" />
                      </svg>
                    </div>
                    <span className="om-card-title">
                      {t.buttonLabel} {selectedBtnIndex + 1} •{" "}
                      {t.shortBtnLabels[selectedBtnIndex]}
                    </span>
                  </div>
                  <button
                    className="om-btn"
                    onClick={async () => {
                      const st = await resetMouseButtons();
                      applyFullState(st);
                      showToast(t.toastButtonsReset);
                    }}
                  >
                    {t.reset}
                  </button>
                </div>

                <div className="om-segmented">
                  <button
                    className={`om-seg-btn ${keyAssignTab === "mouse" ? "active" : ""}`}
                    onClick={() => setKeyAssignTab("mouse")}
                  >
                    {t.catMouse}
                  </button>
                  <button
                    className={`om-seg-btn ${keyAssignTab === "media" ? "active" : ""}`}
                    onClick={() => setKeyAssignTab("media")}
                  >
                    {t.catMedia}
                  </button>
                  <button
                    className={`om-seg-btn ${keyAssignTab === "keyboard" ? "active" : ""}`}
                    onClick={() => setKeyAssignTab("keyboard")}
                  >
                    {t.catKeyboard}
                  </button>
                </div>

                {keyAssignTab === "mouse" && (
                  <div className="om-action-grid">
                    {MOUSE_ACTIONS.map((act) => {
                      const active = buttons[selectedBtnIndex]?.name === act.name;
                      return (
                        <button
                          key={act.name}
                          className={`om-action-chip ${active ? "active" : ""}`}
                          onClick={() => handleAssignAction(act)}
                        >
                          <span>{translateActionName(act.name)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {keyAssignTab === "media" && (
                  <div className="om-action-grid">
                    {MEDIA_ACTIONS.map((act) => {
                      const active = buttons[selectedBtnIndex]?.name === act.name;
                      return (
                        <button
                          key={act.name}
                          className={`om-action-chip ${active ? "active" : ""}`}
                          onClick={() => handleAssignAction(act)}
                        >
                          <span>{translateActionName(act.name)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {keyAssignTab === "keyboard" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="om-segmented">
                      {[
                        { label: "Ctrl", val: modCtrl, set: setModCtrl },
                        { label: "Shift", val: modShift, set: setModShift },
                        { label: "Alt", val: modAlt, set: setModAlt },
                        { label: "Win", val: modWin, set: setModWin },
                      ].map((m) => (
                        <button
                          key={m.label}
                          className={`om-seg-btn ${m.val ? "active" : ""}`}
                          onClick={() => m.set(!m.val)}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        value={selectedHidKey}
                        onChange={(e) => setSelectedHidKey(Number(e.target.value))}
                        className="om-input-text"
                        style={{ flex: 1 }}
                      >
                        {KEYBOARD_HID_KEYS.map((k) => (
                          <option key={k.hidCode} value={k.hidCode}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                      <button
                        className={`om-btn ${listeningKey ? "primary" : ""}`}
                        onClick={() => setListeningKey(!listeningKey)}
                      >
                        {listeningKey ? t.pressKey : t.captureKey}
                      </button>
                    </div>

                    <button className="om-btn primary" onClick={handleAssignKeyCombo}>
                      {t.applyShortcut}
                    </button>
                  </div>
                )}
              </section>

              <section className="om-diagram-card">
                <div className="om-mouse-stage">
                  {[0, 1, 2, 4, 3, 5].map((btnIdx) => {
                    const btn = buttons[btnIdx];
                    const active = selectedBtnIndex === btnIdx;
                    const displayLabel = btn
                      ? translateActionName(btn.name)
                      : t.shortBtnLabels[btnIdx];
                    return (
                      <button
                        key={btnIdx}
                        type="button"
                        className={`om-callout-pin om-pin-${btnIdx} ${
                          active ? "active" : ""
                        }`}
                        onClick={() => setSelectedBtnIndex(btnIdx)}
                      >
                        <span className="om-callout-num">{btnIdx + 1}</span>
                        <span className="om-callout-text">{displayLabel}</span>
                      </button>
                    );
                  })}
                  <div className="om-mouse-render" />
                </div>
              </section>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="om-grid-2">
              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <span className="om-card-title">{t.sensorProcessing}</span>
                  </div>
                </div>

                <div className="om-toggle-row">
                  <div className="om-toggle-label">
                    <span className="om-toggle-name">{t.motionSyncTitle}</span>
                    <span className="om-toggle-sub">{t.motionSyncDesc}</span>
                  </div>
                  <div
                    className={`om-switch ${
                      (config.sensor_flag & SENSOR_FLAG_MOTION_SYNC) !== 0 ? "on" : ""
                    }`}
                    onClick={() => toggleSensorBit(SENSOR_FLAG_MOTION_SYNC)}
                  >
                    <span className="om-switch-thumb" />
                  </div>
                </div>

                <div className="om-toggle-row">
                  <div className="om-toggle-label">
                    <span className="om-toggle-name">{t.rippleControlTitle}</span>
                    <span className="om-toggle-sub">{t.rippleControlDesc}</span>
                  </div>
                  <div
                    className={`om-switch ${
                      (config.sensor_flag & SENSOR_FLAG_RIPPLE_CONTROL) !== 0 ? "on" : ""
                    }`}
                    onClick={() => toggleSensorBit(SENSOR_FLAG_RIPPLE_CONTROL)}
                  >
                    <span className="om-switch-thumb" />
                  </div>
                </div>

                <div className="om-toggle-row">
                  <div className="om-toggle-label">
                    <span className="om-toggle-name">{t.angleSnappingTitle}</span>
                    <span className="om-toggle-sub">{t.angleSnappingDesc}</span>
                  </div>
                  <div
                    className={`om-switch ${
                      (config.sensor_flag & SENSOR_FLAG_LINEAR_CORRECTION) !== 0
                        ? "on"
                        : ""
                    }`}
                    onClick={() => toggleSensorBit(SENSOR_FLAG_LINEAR_CORRECTION)}
                  >
                    <span className="om-switch-thumb" />
                  </div>
                </div>
              </section>

              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span className="om-card-title">{t.hardwareTuning}</span>
                  </div>
                </div>

                <div>
                  <div className="om-stages-meta" style={{ marginBottom: 6 }}>
                    <span>{t.lodTitle}</span>
                    <span>{config.lod_value}.0 mm</span>
                  </div>
                  <div className="om-segmented">
                    {[1, 2].map((lod) => (
                      <button
                        key={lod}
                        className={`om-seg-btn ${config.lod_value === lod ? "active" : ""}`}
                        onClick={() =>
                          commitConfigOptimistic({ ...config, lod_value: lod }, true)
                        }
                      >
                        {lod}.0 mm
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="om-stages-meta" style={{ marginBottom: 6 }}>
                    <span>{t.debounceTitle}</span>
                    <span>{config.key_respond} ms</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={2}
                    value={config.key_respond}
                    className="om-slider"
                    style={{
                      background: `linear-gradient(90deg, #22c55e ${
                        ((config.key_respond - 2) / 28) * 100
                      }%, #1c212b ${((config.key_respond - 2) / 28) * 100}%)`,
                    }}
                    onChange={(e) =>
                      commitConfigOptimistic(
                        { ...config, key_respond: Number(e.target.value) },
                        false
                      )
                    }
                  />
                </div>

                <div>
                  <div className="om-stages-meta" style={{ marginBottom: 6 }}>
                    <span>{t.scrollDirectionTitle}</span>
                  </div>
                  <div className="om-segmented">
                    <button
                      className={`om-seg-btn ${config.scroll_flag === 0 ? "active" : ""}`}
                      onClick={() =>
                        commitConfigOptimistic({ ...config, scroll_flag: 0 }, true)
                      }
                    >
                      {t.scrollStandard}
                    </button>
                    <button
                      className={`om-seg-btn ${config.scroll_flag === 1 ? "active" : ""}`}
                      onClick={() =>
                        commitConfigOptimistic({ ...config, scroll_flag: 1 }, true)
                      }
                    >
                      {t.scrollReverse}
                    </button>
                  </div>
                </div>
              </section>

              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                      </svg>
                    </div>
                    <span className="om-card-title">{t.rgbLighting}</span>
                  </div>
                </div>

                <div className="om-segmented">
                  {LIGHT_MODE_OPTIONS.map((lm) => (
                    <button
                      key={lm.value}
                      className={`om-seg-btn ${
                        config.light_mode === lm.value ? "active" : ""
                      }`}
                      onClick={() => handleLightSelect(lm.value)}
                    >
                      {t.lightModes[lm.value] ?? lm.name}
                    </button>
                  ))}
                </div>

                <div className="om-toggle-row">
                  <div className="om-toggle-label">
                    <span className="om-toggle-name">{t.turnOffLedMovingTitle}</span>
                    <span className="om-toggle-sub">{t.turnOffLedMovingDesc}</span>
                  </div>
                  <div
                    className={`om-switch ${config.move_light_flag === 1 ? "on" : ""}`}
                    onClick={() =>
                      commitConfigOptimistic(
                        {
                          ...config,
                          move_light_flag: config.move_light_flag === 1 ? 0 : 1,
                        },
                        true
                      )
                    }
                  >
                    <span className="om-switch-thumb" />
                  </div>
                </div>
              </section>

              <section className="om-card">
                <div className="om-card-header">
                  <div className="om-card-title-group">
                    <div className="om-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    </div>
                    <span className="om-card-title">{t.powerManagement}</span>
                  </div>
                  <span className="om-badge-soft">{config.sleep_light} min</span>
                </div>

                <div className="om-segmented">
                  {SLEEP_TIME_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      className={`om-seg-btn ${
                        config.sleep_light === s.value ? "active" : ""
                      }`}
                      onClick={() =>
                        commitConfigOptimistic({ ...config, sleep_light: s.value }, true)
                      }
                    >
                      {s.value}m
                    </button>
                  ))}
                </div>

                <div className="om-toggle-row">
                  <div className="om-toggle-label">
                    <span className="om-toggle-name">{t.wakeOnMoveTitle}</span>
                    <span className="om-toggle-sub">{t.wakeOnMoveDesc}</span>
                  </div>
                  <div
                    className={`om-switch ${config.wakeup_flag === 1 ? "on" : ""}`}
                    onClick={() =>
                      commitConfigOptimistic(
                        { ...config, wakeup_flag: config.wakeup_flag === 1 ? 0 : 1 },
                        true
                      )
                    }
                  >
                    <span className="om-switch-thumb" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="om-grid-3">
              <section
                className="om-card"
                onClick={() => setActiveTab("performance")}
                style={{ cursor: "pointer" }}
              >
                <span className="om-section-label" style={{ padding: 0 }}>
                  {t.activeSensitivity}
                </span>
                <div className="om-card-readout">
                  {currentDpiValue.toLocaleString()} DPI
                </div>
                <span className="om-badge-soft" style={{ alignSelf: "flex-start" }}>
                  {t.stageOf(activeDpiIndex + 1, config.dpi_count)}
                </span>
              </section>

              <section
                className="om-card"
                onClick={() => setActiveTab("performance")}
                style={{ cursor: "pointer" }}
              >
                <span className="om-section-label" style={{ padding: 0 }}>
                  {t.pollingRate}
                </span>
                <div className="om-card-readout">{currentHzObj.hz} Hz</div>
                <span className="om-badge-soft" style={{ alignSelf: "flex-start" }}>
                  {t.intervalMs(1000 / currentHzObj.hz)}
                </span>
              </section>

              <section
                className="om-card"
                onClick={() => setActiveTab("advanced")}
                style={{ cursor: "pointer" }}
              >
                <span className="om-section-label" style={{ padding: 0 }}>
                  {t.hardwareDsp}
                </span>
                <div className="om-card-readout">
                  LOD {config.lod_value}.0mm • {config.key_respond}ms
                </div>
                <span className="om-badge-soft" style={{ alignSelf: "flex-start" }}>
                  {t.motionSyncState(
                    (config.sensor_flag & SENSOR_FLAG_MOTION_SYNC) !== 0
                  )}
                </span>
              </section>
            </div>
          )}

          {activeTab === "backups" && (
            <section className="om-card">
              <div className="om-card-header">
                <div className="om-card-title-group">
                  <div className="om-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    </svg>
                  </div>
                  <span className="om-card-title">{t.profilesTitle}</span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder={t.profilePlaceholder}
                    value={newBackupName}
                    onChange={(e) => setNewBackupName(e.target.value)}
                    className="om-input-text"
                  />
                  <button className="om-btn primary" onClick={handleCreateProfile}>
                    {t.saveCurrent}
                  </button>
                  <button
                    className="om-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.importJson}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={handleImportFile}
                  />
                </div>
              </div>

              <div className="om-profile-list">
                {backups.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", padding: "16px 4px" }}>
                    {t.noProfiles}
                  </div>
                ) : (
                  backups.map((b) => (
                    <div key={b.id} className="om-profile-item">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{b.name}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          {b.config.dpi1_value}/{b.config.dpi2_value}/
                          {b.config.dpi3_value} DPI •{" "}
                          {REPORT_RATE_OPTIONS.find(
                            (r) => r.index === b.config.report_rate
                          )?.hz ?? 1000}{" "}
                          Hz • LOD {b.config.lod_value}mm
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="om-btn primary"
                          onClick={async () => {
                            const st = await applyBackupToMouse(b.config, b.buttons);
                            applyFullState(st);
                            showToast(t.toastProfileApplied(b.name));
                          }}
                        >
                          {t.apply}
                        </button>
                        <button
                          className="om-btn"
                          onClick={() => handleExportProfile(b)}
                        >
                          {t.exportBtn}
                        </button>
                        <button
                          className="om-btn danger"
                          onClick={async () => {
                            const list = await deleteBackup(b.id);
                            setBackups(list);
                          }}
                        >
                          {t.deleteBtn}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {toast && (
            <div className={`om-toast ${toast.isError ? "error" : ""}`}>
              <span className="om-dot" />
              <span>{toast.text}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
