
# Irrigation Simulator

A gravity-powered greenhouse irrigation simulator and interactive playground.

This repository contains a minimal Bun + Vite + React (TypeScript) app that simulates water collection from roof panels into storage barrels and gravity-fed outflow through pipes. The UI is interactive: click items (barrel, pipes) to edit parameters, control simulation time scale, and view real-time metrics.

Features

- 2D side-view simulation with toggleable perspectives
- Click-to-edit entities: barrels, pipes, valves
- Simplified hydraulic core (height → pressure → flow) suitable for real-time animation
- Seasonal rain models and user-configurable panels
- Time acceleration, simulation timestamps, and live metrics (level, flow, pressure)

Prerequisites

- Bun (recommended) — https://bun.sh/

Quickstart (Bun)

```bash
cd irrigationsimulator
bun install
bun run dev
```

Then open the local dev URL printed by Vite.

Notes

- The simulator uses a simplified orifice/pipe model for real-time responsiveness. If you want higher-fidelity hydraulics (transient CFD), we can add server-side compute or integrate a more advanced solver.
- Default scene uses the greenhouse and barrel parameters collected during the interactive session.

Project layout

- `index.html` — app entry
- `src/main.tsx` — app bootstrap
- `src/App.tsx` — main UI
- `src/components/` — `Canvas2D`, `EditorPanel`
- `src/sim/` — simplified simulation core (`simulator.ts`)

Contributing

1. Fork the repo and create a feature branch.
2. Keep changes focused and add tests where appropriate.
3. Open a PR with a clear description of changes.

License

This project is unlicensed. Add a license file if you want to publish.

