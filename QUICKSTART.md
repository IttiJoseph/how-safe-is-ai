# Quick Start Guide

## Prerequisites

1. **Claude Pro subscription** ($20/month) — subscribe at https://claude.ai/upgrade
2. **Node.js 18+** — download from https://nodejs.org (LTS version)
3. **Git** — you likely have this already
4. **GitHub account** — for hosting

## Step 1: Install Claude Code (~5 min)

Open your terminal and run:

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify it works
claude --version

# Start Claude Code and log in with your Claude account
claude
```

When prompted, sign in with the same account you use for Claude Pro.

## Step 2: Create the repo (~3 min)

```bash
# Create a new directory
mkdir how-safe-is-ai
cd how-safe-is-ai

# Initialize git
git init
```

## Step 3: Add the spec files

Copy these files into the repo root:

- `CLAUDE.md` → the main spec file (Claude Code reads this automatically)
- `src/config/categories.json` → category definitions
- `src/data/sampleData.json` → sample CVE data for development

The CLAUDE.md file is special — Claude Code automatically reads it when you start a session in this directory. It contains the full project spec, so Claude Code will know exactly what to build.

## Step 4: Start building

```bash
# Start Claude Code in the project directory
claude

# Then tell it:
# "Read the CLAUDE.md and start with Phase 1: Scaffold the project"
```

Work through the phases in order:
1. Scaffold (React + Vite + dependencies)
2. Layout + Intro Section
3. Petri Dishes (2-3 unique + default)
4. Lab Notes Panel
5. Polish
6. Data Pipeline (GitHub Action)
7. Deploy to GitHub Pages

**Tip:** At each phase, review what Claude Code built before moving to the next. You can ask it to adjust anything.

## Step 5: Push to GitHub

```bash
# Create the repo on GitHub (public, so GitHub Pages is free)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/how-safe-is-ai.git
git push -u origin main
```

## Step 6: Enable GitHub Pages

1. Go to your repo on GitHub
2. Settings → Pages
3. Source: GitHub Actions (or deploy from branch, depending on how the build is configured)
4. Your site will be live at `https://YOUR_USERNAME.github.io/how-safe-is-ai`

## Step 7: Cancel Pro if you want

Once the project is built and deployed, the site runs entirely on free infrastructure (GitHub Pages + GitHub Actions). You can cancel your Claude Pro subscription if you only needed it for the build phase.

## Ongoing: The daily data refresh

The GitHub Action runs automatically at 00:00 UTC daily. It:
1. Fetches fresh CVE data from NVD + GitHub Advisory
2. Categorizes and processes it
3. Commits updated JSON to the repo
4. GitHub Pages auto-deploys

You don't need to do anything — the site stays current on its own.

## Troubleshooting

- **Claude Code not found:** Make sure Node.js 18+ is installed, then reinstall with `npm install -g @anthropic-ai/claude-code`
- **Authentication issues:** Run `/logout` then `/login` inside Claude Code
- **Rate limits:** If you hit Claude Pro limits, take a break and come back. The rolling window resets every 5 hours.
- **GitHub Pages not updating:** Check that the GitHub Action ran successfully in the Actions tab
