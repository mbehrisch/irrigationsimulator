# Product Requirements Document (PRD)

Project: Irrigation Simulator
Owner: Project Team
Date: 2026-01-20

1. Summary
- Build an interactive, browser-based gravity-fed greenhouse irrigation simulator that lets users design and validate simple rain-capture and storage systems, visualize flows in real time, and iterate layout and parameter choices quickly.

2. Objectives
- Enable fast, hands-on exploration of storage sizing, pipe/valve behaviour and basic automatic control (float-valves).
- Provide clear, actionable visual feedback (levels, flows, pressures) and the ability to export/import scenarios.
- Ship an approachable MVP in the repo (Bun + Vite + React + TypeScript) with a clean UI and documented scenes.

3. Primary Users & Personas
- Hobby Grower: wants to size barrels and test how long storage lasts under different rain rates.
- Educator/Student: demonstrates pressure-head → flow relationships and basic automation.
- Maker/Contributor: extends scenarios and improves models.

4. User Stories (MVP)
- As a user, I can place storage barrels in a plan view and set their size and height.
- As a user, I can place rain collection surfaces with outlet pipel in a plan view and set their width and height.
- As a user, I can simulate seasonal rain input and see barrel levels update in real time.
- As a user, I can toggle between plan (layout) and simulate (runtime) modes.
- As a user, I can set a numeric time-scale to accelerate simulation and observe outcomes.
- As a user, I can enable/disable float-valve automation and set its setpoint.
- As a user, I can export the current scene to JSON and import it back.

5. Functional Requirements
- FR-1: Multi-barrel support with per-barrel parameters (height, volume, rack height, float valve config).
- FR-2: Simple hydraulic model (height → pressure → orifice/pipe flow) that runs in the browser at interactive rates.
- FR-3: Canvas-based 2D visualizer supporting side (profile) and top (plan) views.
- FR-4: Editor panel for per-entity edits; changes immediately update simulation config.
- FR-5: Time scaling control (numeric input) and current sim timestamp display.
- FR-6: Scene export/import (JSON) stored in `scenarios/` directory for examples.
- FR-7: Responsive UI, crisp canvas rendering on high-DPI displays.

6. Non-Functional Requirements
- NFR-1: Real-time responsiveness for typical scenes (up to ~50 entities) at 60fps rendering where feasible.
- NFR-2: Cross-platform dev flow using Bun + Vite; HMR enabled for rapid iteration.
- NFR-3: Accessibility: basic keyboard navigation for editor controls.
- NFR-4: Code quality: TypeScript types for simulator core and component props, unit tests for core numerical functions.

7. Acceptance Criteria (MVP)
- AC-1: Place and drag barrels in plan view; positions persist when exported/imported.
- AC-2: Levels update and render correctly in side view under default seasonal rain rates.
- AC-3: Numeric time-scale works (1x, 5x, 10x or user value) and sim time advances accordingly.
- AC-4: Float-valve toggles open/closed at configured setpoint and prevents overflow when enabled.
- AC-5: Scene export produces JSON that re-imports to reconstruct the same layout and parameters.

8. UI/UX Requirements
- Main canvas area (left) with header controls for time-scale, perspective, and mode.
- Right-side editor panel with grouped controls and clear apply/close actions.
- Use Tailwind utility classes and optionally `shadcn` primitives later for consistent components.
- Provide example scenarios accessible from the UI (Phase 2).

9. Data & Export Format
- JSON structure: top-level `scenes[]` with `barrels[]` (params + pos), `pipes[]`, `panels[]`, and metadata (units, date, sim params).
- Place example scenes in `scenarios/` and reference them from README.

10. Milestones / Roadmap
- Milestone 1 (this sprint): UI polish, PRD added, crisp canvas text, numeric time-scale, product brief.
- Milestone 2: Scene import/export, example scenarios, unit tests for simulator core, CI config.
- Milestone 3: Component library integration (shadcn), improved hydraulics and routing, deploy to GitHub Pages.

11. Risks
- Simplified physics may be misused for production decisions — include clear disclaimers.
- Performance degradation with many entities — mitigate by profiling and using Web Workers if needed.

12. Dependencies
- Bun, Vite, React, TypeScript, Tailwind CSS (postcss), optional shadcn components.

13. Next Actions for Planner Agent
- Create issues for: export/import, example scenarios, unit tests for `simulator.ts`, CI/formatting, shadcn integration.
- Draft a simple scenario list (`scenarios/`) and an example JSON.

14. Contact
- Project workspace in local repo. Push to GitHub when ready: https://github.com/mbehrisch/irrigationsimulator.git
