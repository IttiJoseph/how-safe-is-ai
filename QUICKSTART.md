# Quick Start — How Safe Is AI?

For returning users who need a fast reminder. See `docs/BUILD-INSTRUCTIONS.md` for the full guide.

---

## Resume a session

1. Open a Codespace from the repo page (or `cd` into the project locally)
2. Run `claude` — it auto-reads `CLAUDE.md` from root
3. Tell Claude Code which phase you're on

---

## Build phases at a glance

| Phase | Prompt to use |
|---|---|
| 1 — Scaffold | "Read the CLAUDE.md and start with Phase 1: Scaffold the project" |
| 2 — Layout | "Build Phase 2: Layout and Intro Section" |
| 3 — Petri Dishes ⭐ | "Build Phase 3: Petri Dishes with SVG filters and Canvas rendering. Start with Prompt Injection and Supply Chain unique patterns, use the default pattern for the rest." |
| 4 — Lab Notes | "Build Phase 4: Lab Notes Panel with hover-highlight interactions" |
| 5 — Polish | "Build Phase 5: Polish — animations, lab bench texture, responsive design, typography" |
| 6 — Pipeline | "Build Phase 6: Create the Python data pipeline script and GitHub Action workflow" |
| 7 — Deploy | "Build Phase 7: Configure Vite for GitHub Pages and set up deployment" |

---

## Key tips

- **Phase 3 is the core visual** — spend the most time here before moving on
- **Verify the dev server** after Phase 1: `npm run dev` → port 5173
- **Get your NVD API key** before Phase 6 (nvd.nist.gov, free, ~1hr activation)
- **Enable GitHub Pages** after Phase 7: Settings → Pages → Source: GitHub Actions
- **Rate limits?** Take a 5-hour break, then continue

---

## Dev server

```bash
npm run dev
```

Site auto-refreshes at `http://localhost:5173` as you make changes.
