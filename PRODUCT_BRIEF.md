# Product Brief — Irrigation Simulator

Purpose
- Provide an interactive, browser-based sandbox for designing and testing gravity-fed greenhouse irrigation systems. The tool helps hobbyists, small growers, and educators explore storage, pipe sizing, and valve behaviours under seasonal rain patterns.

Target users
- Small-scale greenhouse owners and hobby growers who want to prototype water-harvesting layouts.
- Agricultural extension educators and students learning basic hydraulics and water management.
- Makers and open-source contributors who want a lightweight simulation playground.

Primary goals (MVP)
- Real-time 2D simulation of rain collection, barrel storage and gravity-fed outflow.
- Click-to-edit entities (barrels, valves, pipe sizes) and plan-mode layout placement.
- Time-acceleration controls, live metrics (level, flow, pressure, fill%), and simple float-valve automation.
- Export/import scene JSON and runnable frontend (Bun + Vite + React).

Success metrics (first 3 months)
- 1,000 local runs (dev server or deployed preview) by community testers.
- 50 user-contributed scenarios uploaded/shared (JSON).
- No major UI/UX blockers; average user can create a basic layout in under 10 minutes.

Roadmap
- Phase 1 (MVP, current): polish UI, ensure crisp rendering, numeric controls, plan vs simulate, multi-barrel + float valve, Tailwind styling, Bun dev flow. Add PRODUCT_BRIEF.md and documentation.
- Phase 2 (near-term): scene export/import, scenario library, shadcn-based UI components, improved hydraulics (pipe-network routing), unit tests and CI, GitHub Pages deploy.
- Phase 3 (long-term): higher-fidelity solvers (optional server-side), irrigation scheduling optimizer, sensor integration (IoT), collaborative layout editing.

Key risks & mitigations
- Simplified hydraulics may mislead for production design — clearly label results as approximate; provide references and export for further analysis.
- Browser performance with many entities — keep core model lightweight; profile and add worker-based compute if needed.

Next steps (immediate)
- Finish UI polish with Tailwind/shadcn components and confirm HMR/dev flow works reliably under Bun.
- Add `Export/Import JSON` and a small `scenarios/` folder with example scenes.
- Create a README section summarizing usage and where to contribute.

Contact & contribution
- Repo: (local workspace) — push to GitHub when ready. Open issues/PRs for feature requests.

---
Generated: January 20, 2026
