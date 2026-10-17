# K-Snake X11 Control Center (Mouse Hub)

Software desktop nativo para Windows construído em **Rust (Tauri v2 + `hidapi`)** e **React + TypeScript** para controle completo do mouse gamer **K-Snake X11** (USB e Wireless 2.4G).

Desenvolvido por **[dluccz](https://github.com/dluccz)** — [dluc.cz](https://dluc.cz/)

---

## Recursos

- **Comunicação Direta USB / 2.4G HID**:
  - Suporte nativo aos receptores `VID 0xA8A4` (USB) e `VID 0xA8A5` (2.4G) / `PID 0x2255` (`UsagePage 0xFF01`, `Usage 0x0010`).
  - Atualização assíncrona em tempo real (0ms de travamento na interface).
- **Desempenho e Sensor**:
  - 6 estágios de sensibilidade independentes (`200 DPI` a `12.000 DPI` em passos de `100 DPI`).
  - Taxa de atualização (*Polling Rate*): `125 Hz`, `250 Hz`, `500 Hz` e `1000 Hz`.
- **Funções Avançadas Desbloqueadas do Firmware**:
  - **Motion Sync**, **Ripple Control** e **Angle Snapping (Correção Linear)**.
  - **Altura de Corte (LOD)**: `1.0 mm` ou `2.0 mm`.
  - **Tempo de Debounce do Clique**: ajuste fino de `2 ms` a `30 ms`.
  - **Direção da Roda de Scroll**: Normal ou Invertido.
  - **Iluminação RGB** (7 modos) + opção de desligar LED ao mover o mouse para economia de bateria.
  - **Gerenciamento de Energia**: timer de suspensão (`1` a `60` min) e despertar ao mover.
- **Mapeamento Interativo de 6 Botões**:
  - Funções de mouse, multimídia, atalhos do sistema e captura direta de combinações de teclado (`Ctrl`, `Shift`, `Alt`, `Win` + Tecla).
- **Sistema de Perfis e Backups**:
  - Biblioteca local de perfis com restauração em 1 clique e exportação/importação de arquivos `.json`.
- **Interface Multidioma**:
  - Português (`PT-BR`) e Inglês (`EN`) com barra de título customizada sem bordas nativas.

---

## Como Usar a Versão Portátil (Sem Instalação)

1. Baixe o arquivo `.zip` na seção **[Releases](../../releases)** deste repositório.
2. Extraia a pasta em qualquer local do computador.
3. Execute `K-Snake-X11-Control-Center.exe`.

---

## Compilando a partir do Código-Fonte

### Pré-requisitos
- Node.js 18+
- Rust (`stable`)
- Windows SDK / MinGW-w64

### Comandos
```powershell
npm install
npm run tauri build
```

---

## Créditos

- Autor: **[dluccz](https://github.com/dluccz)**
- Website: **[https://dluc.cz/](https://dluc.cz/)**
