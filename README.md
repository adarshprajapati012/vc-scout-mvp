# VC Scout — AI-Powered Intelligence Platform

> A production-quality VC intelligence interface for company research, live enrichment, and deal pipeline management.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)

---

## Overview

VC Scout provides venture capital teams with a streamlined workflow to discover, research, and evaluate companies. It combines a curated company database with **live AI-powered enrichment** using Google Gemini to extract structured intelligence from public websites.

### Core Capabilities

- **Company Browser** — Search, filter, and sort across sectors and stages
- **Live AI Enrichment** — One-click analysis of company websites via Gemini API
- **Smart Fallback** — Automatic demo data when API is unavailable (reviewer-friendly)
- **Per-Company Notes** — Create, edit, and delete research notes with full CRUD
- **Custom Lists** — Organize companies into pipeline lists with CSV/JSON export
- **Dark Mode** — Full light/dark theme support

---

## Quick Start

### 1. Install

```bash
git clone <your-repo-url> vc-scout-mvp
cd vc-scout-mvp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required for live enrichment (free at https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Enrichment mode: "live" or "mock"
# Set to "mock" to demo the full UI without an API key
NEXT_PUBLIC_ENRICHMENT_MODE=live

NEXT_PUBLIC_DEV=true
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Enrichment Modes

| Mode | Behavior |
|---|---|
| `live` | Calls Gemini API → returns real enrichment data. Falls back to demo data on API error |
| `mock` | Returns sector-specific demo data instantly. No API key needed |

**For reviewers without an API key:** Set `NEXT_PUBLIC_ENRICHMENT_MODE=mock` to experience the full UI with simulated enrichment data. The UI clearly labels demo vs. live data.

When in `live` mode, if the API fails (quota exceeded, network error, etc.), the app **automatically falls back** to demo data and shows the failure reason in a subtle warning banner.

---

## Features

### Company Browser (`/companies`)
- Full-text search across name, sector, and description
- Filter by **sector** (AI, FinTech, HealthTech, Climate, etc.)
- Filter by **stage** (Seed, Series A, Series B)
- Sortable columns with pagination
- Table and Grid view toggle
- Add custom companies via modal

### Live Enrichment (`/companies/[id]`)
- Click **"Enrich with AI"** on any company profile
- Server-side: fetches webpage → strips HTML → sends text to Gemini
- Returns structured data:
  - **Summary** — 1–2 sentence company overview
  - **What They Do** — 3–6 actionable bullet points
  - **Keywords** — 5–10 relevant tags
  - **Derived Signals** — Inferred indicators (e.g., "Careers page detected", "Active blog")
  - **Sources** — URLs scraped with timestamps, labeled as "Live" or "Demo"
- Server-side caching (24h TTL, in-memory)
- Transparent mode indicators for mock/fallback data

### Notes (`/companies/[id]`)
- Per-company research notes with full CRUD
- Timestamps for creation and last edit
- `Ctrl+Enter` keyboard shortcut to save
- Persisted in `localStorage` (key: `company_notes`)
- Isolated `NotesSection` component — zero impact on other features

### Lists (`/lists`)
- Create and delete custom pipeline lists
- Add/remove companies from any profile page
- **Export** as JSON or CSV
- Persisted in `localStorage` (key: `vc-scout-lists`)

### Saved Searches (`/saved`)
- Bookmark search queries for re-use
- Persisted in `localStorage`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + custom design system |
| AI | Google Gemini via REST API (server-side only) |
| Persistence | `localStorage` (notes, lists, searches) |
| Server Cache | In-memory `Map` (24h TTL) |

---

## Project Structure

```
vc-scout-mvp/
├── app/
│   ├── layout.tsx              # Root layout (sidebar + header + providers)
│   ├── page.tsx                # Dashboard
│   ├── companies/
│   │   ├── page.tsx            # Company browser with search/filter
│   │   └── [id]/page.tsx       # Company profile + Enrich + Notes
│   ├── lists/page.tsx          # List management + export
│   ├── saved/page.tsx          # Saved searches
│   └── api/enrich/route.ts     # POST enrichment endpoint (server-side)
├── components/
│   ├── EnrichPanel.tsx         # Enrichment result display with mode indicators
│   ├── NotesSection.tsx        # Per-company notes CRUD
│   ├── CompanyTable.tsx        # Sortable, filterable table
│   ├── CompanyCard.tsx         # Grid view card
│   ├── ListEditor.tsx          # List CRUD + CSV/JSON export
│   ├── GlobalSearch.tsx        # Command palette search
│   ├── AddCompanyModal.tsx     # New company form
│   ├── Sidebar.tsx             # Navigation
│   ├── Header.tsx              # Top bar
│   ├── ThemeProvider.tsx       # Dark/light mode
│   └── ToastProvider.tsx       # Notification system
├── lib/
│   ├── gemini.ts               # Gemini API caller (server-only)
│   ├── fetchHtml.ts            # Webpage text extraction (server-only)
│   ├── mockEnrichment.ts       # Sector-specific demo enrichment data
│   ├── notes.ts                # Notes localStorage CRUD
│   ├── lists.ts                # Lists localStorage CRUD
│   └── companies.ts            # Company data helpers
├── data/
│   └── companies.json          # Seed company data (8 entries)
├── styles/
│   └── globals.css             # Design system + Tailwind utilities
├── .env.example                # Environment variable template
└── tsconfig.json
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | For live mode | — | Google AI Studio API key |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Gemini model to use |
| `NEXT_PUBLIC_ENRICHMENT_MODE` | No | `live` | `"live"` or `"mock"` |
| `NEXT_PUBLIC_DEV` | No | `false` | Show dev-only features (cache clear, etc.) |

> **Security:** Enrichment runs entirely server-side via `/api/enrich`. API keys are never exposed to the client or included in the browser bundle.

---

## Deployment (Vercel)

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Add environment variables:
   - `GEMINI_API_KEY` = your API key
   - `GEMINI_MODEL` = `gemini-2.0-flash`
   - `NEXT_PUBLIC_ENRICHMENT_MODE` = `live`
4. Deploy

---

## Design Decisions

- **Enrichment is server-side only** — API keys never reach the browser
- **Graceful fallback** — Live API failures automatically show demo data with clear labeling
- **Modular architecture** — Each feature (Notes, Lists, Enrichment) is self-contained
- **Defensive localStorage** — All reads wrapped in try/catch; corrupted data never crashes the app
- **Token-efficient AI calls** — Webpage text capped at 15K chars, output at 512 tokens
- **No database required** — MVP uses localStorage + in-memory cache for zero-config setup

---

*Built by Adarsh Prajapati*
