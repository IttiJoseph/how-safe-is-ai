# How Safe Is AI? — Build Instructions

Step-by-step guide from setup to deployment. Everything runs in the browser — no local software installation required.

---

## Prerequisites

- **GitHub account** (free)
- **Claude Pro subscription** ($20/month) for Claude Code access — subscribe at [claude.ai/upgrade](https://claude.ai/upgrade)
- **A modern web browser** (Chrome, Firefox, Edge)

You'll use **GitHub Codespaces** as your development environment — a full VS Code editor in your browser with a built-in terminal. The free tier includes 120 core-hours/month, which is more than enough.

---

## Setup

### Step 1: Create the GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `how-safe-is-ai`
3. Set visibility to **Public** (required for free GitHub Pages)
4. Check **"Add a README file"**
5. Click **Create repository**

### Step 2: Upload the Spec Files

You have 4 files to place in the repo:

**Root files:**
On your repo page, click "Add file" → "Upload files". Drag in `CLAUDE.md` and `QUICKSTART.md`. Click "Commit changes".

**Config file:**
Click "Add file" → "Create new file". Type `src/config/categories.json` as the filename (GitHub creates the folders automatically). Paste the contents of `categories.json` into the editor. Commit.

**Sample data:**
Repeat the same process. Create `src/data/sample-cves.json` and paste the contents of `sample-cves.json`. Commit.

### Step 3: Open GitHub Codespaces

1. On your repo page, click the green **"<> Code"** button
2. Switch to the **"Codespaces"** tab
3. Click **"Create codespace on main"**
4. Wait for the environment to load — a full VS Code editor opens in your browser

### Step 4: Install Claude Code

In the Codespaces terminal (bottom panel), run:

```bash
npm install -g @anthropic-ai/claude-code
```

Then start Claude Code:

```bash
claude
```

Sign in with your Claude Pro account when prompted. Claude Code will automatically read the `CLAUDE.md` file in your repo root and understand the full project spec.

---

## Build Phases

Work through these in order. Complete each phase before moving to the next.

### Phase 1: Scaffold

**Tell Claude Code:**
> "Read the CLAUDE.md and start with Phase 1: Scaffold the project"

Claude Code will initialize a React app with Vite, install D3.js, and create the project folder structure. When it's done, verify the dev server runs:

```bash
npm run dev
```

Codespaces will show a popup: "Your application is running on port 5173." Click **"Open in Browser"** to get a live preview tab. Keep this open throughout — it auto-refreshes as code changes.

**What you'll see:** A blank page. That's expected. Move on.

---

### Phase 2: Layout + Intro Section

**Tell Claude Code:**
> "Build Phase 2: Layout and Intro Section"

This builds the intro section (headline, explanation text, stats bar), the 3×3 grid layout with placeholder dish containers, and the footer.

**What you'll see:** The page structure with text, empty circular dish outlines in a grid, and a footer.

**What to review:** Does the intro text feel right? Is the grid spacing good? Are the dish placeholder sizes appropriate? Ask Claude Code to adjust anything before moving on.

---

### Phase 3: Petri Dishes ⭐ (core visual — spend time here)

**Tell Claude Code:**
> "Build Phase 3: Petri Dishes with SVG filters and Canvas rendering. Start with Prompt Injection and Supply Chain unique patterns, use the default pattern for the rest."

This is the most complex phase. Claude Code will build:
- SVG filter layer (agar texture, organic edges, color bleeding)
- Canvas rendering layer (metaball colony blobs)
- 2–3 unique dish pattern algorithms
- Default pattern for remaining dishes

**What you'll see:** Organism colonies growing inside the petri dishes, driven by sample data. Patched CVEs appear faded; unpatched are vivid. Different dishes have different colors and patterns.

**What to review:** This is the heart of the project. Spend time here. Are the colonies organic enough? Is the agar texture convincing? Do the colors work? Are patched/unpatched differences clear?

Give specific feedback: "make the tendrils thinner", "the agar is too dark", "more color contrast between severity levels".

---

### Phase 4: Lab Notes Panel

**Tell Claude Code:**
> "Build Phase 4: Lab Notes Panel with hover-highlight interactions"

This adds the click-to-focus interaction: clicking a dish opens the lab notes panel beside it, other dishes fade/blur. The notes contain five sections (header, about, why it looks this way, observations, treatment status). Hovering severity levels or patch status highlights corresponding zones in the dish.

**What to review:** Does the fade/blur feel smooth? Are the notes readable? Does hover-highlighting make the data-visual connection obvious?

---

### Phase 5: Polish

**Tell Claude Code:**
> "Build Phase 5: Polish — animations, lab bench texture, responsive design, typography"

Final visual pass: subtle bench grain texture, smooth transitions, breathing animations, responsive layout, and typography refinement (serif for intro, monospace for notes).

**What to review:** View at different browser widths. Check animation performance (should be smooth). Does it feel cohesive end-to-end?

---

### Phase 6: Data Pipeline

**Tell Claude Code:**
> "Build Phase 6: Create the Python data pipeline script and GitHub Action workflow"

Claude Code creates the Python script (`scripts/fetch-cves.py`) that queries NVD and GitHub Advisory APIs, categorizes CVEs, derives patch status, computes stats, and outputs JSON. It also creates the GitHub Action workflow (`.github/workflows/update-data.yml`) to run this daily.

**Testing:** Run the Python script manually in the terminal to verify it fetches real data. Push to GitHub and check the Actions tab to confirm the workflow runs.

---

### Phase 7: Deploy to GitHub Pages

**Tell Claude Code:**
> "Build Phase 7: Configure Vite for GitHub Pages and set up deployment"

Once pushed:
1. Go to your repo on GitHub
2. Navigate to **Settings → Pages**
3. Under Source, select **GitHub Actions**
4. Your site will be live at `https://YOUR_USERNAME.github.io/how-safe-is-ai`

---

## Review Checkpoints

Not every phase needs heavy review. Here's where to spend your time:

| Phase | What You See | Review Effort |
|---|---|---|
| 1 — Scaffold | Blank page, dev server running | Quick verify, move on |
| 2 — Layout | Intro text, empty grid, footer | Light: spacing, typography |
| **3 — Petri Dishes** | **Organisms rendering in dishes** | **Heavy — this is the core visual** |
| 4 — Lab Notes | Click interaction, notes panel | Medium: interaction feel |
| 5 — Polish | Animations, texture, responsive | Final visual pass |
| 6 — Pipeline | Real data flowing in | Verify data accuracy |
| 7 — Deploy | Site live on GitHub Pages | Quick verify |

---

## Tips for Working with Claude Code

- **Be specific with visual feedback.** "Make the tendrils thinner and more transparent" works better than "it doesn't look right."
- **Review each phase before moving on.** Fixing Phase 3 issues during Phase 3 is much easier than going back during Phase 5.
- **Codespaces auto-stops after 30 minutes of inactivity** to save your free hours. Restart anytime from the repo page — your work is saved.
- **If you hit Claude Pro rate limits,** take a break. The rolling window resets every 5 hours.
- **Use `/cost`** inside Claude Code to monitor your usage.
- **If something breaks,** tell Claude Code "the site is broken, here's what I see" and paste any error messages from the browser console (F12 → Console tab).

---

## After Launch

Once the site is live and the daily pipeline is running:

- **The site updates itself daily.** No action needed.
- **To add a new category,** edit `src/config/categories.json` and push. The grid grows automatically.
- **To add unique patterns** for remaining dishes, start a new Claude Code session and request specific pattern implementations.
- **You can cancel Claude Pro** if you're done building. The deployed site costs $0/month to run.
