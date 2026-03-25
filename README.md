# Simple Plan Space

A free, open-source floor plan design tool that runs in the browser. Create house plans with rooms, doors, windows, columns, and multiple floors — all with drag-and-drop editing, real-time dimensions, and automatic saving.

Works fully offline with localStorage. Optionally add user accounts via Supabase for cross-device sync.

## Features

**Design Tools**
- Drag-and-drop room placement with 0.5m grid snapping
- Resize rooms by dragging edge handles
- Place doors (single swing, double, sliding, pocket, bi-fold)
- Place windows (standard, large, small, floor-to-ceiling)
- Place structural columns
- Smart snap guides that highlight when room edges align
- 13 room types with distinct colors (living, kitchen, bedroom, bathroom, courtyard, iwan, etc.)

**Floor Management**
- Unlimited floors per project
- Copy entire floor with all rooms and elements
- Per-floor ceiling height setting
- Floor tabs with rename support

**Measurements**
- Metric (meters, cm) and Imperial (feet, inches) unit systems
- Configurable wall thickness with correct proportional rendering
- Room area auto-calculation
- Area summary with breakdown by room type and coverage percentage
- Staircase calculator (steps, riser, tread, run length from floor height)

**Editing**
- Undo / Redo with Ctrl+Z / Ctrl+Y (50-step history)
- Arrow key nudging (0.5m steps, Shift for 1m)
- Duplicate rooms
- Edit all properties numerically in the side panel
- Delete with keyboard Delete/Backspace

**Export & Print**
- Export project as JSON
- Print / Save as PDF (clean plan without UI chrome)

**Mobile**
- Fully responsive mobile UI
- Bottom sheet panel with swipe
- Larger touch targets for handles
- Floating action button for quick room add

**Accounts (Optional)**
- Works without any account (localStorage)
- Optional email/password or Google sign-in via Supabase
- Automatic sync: local data migrates to cloud on first sign-in
- Cross-device access to all projects

## Quick Start (Local Development)

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/floor-plan-studio.git
cd floor-plan-studio

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 — the app works immediately in local-only mode.

## Deployment Guide

### Step 1: Push to GitHub

Create a new repository on GitHub and push this code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/floor-plan-studio.git
git push -u origin main
```

### Step 2: Set Up Supabase (Free — Optional)

Skip this step if you don't need user accounts. The app works fully with localStorage alone.

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** — choose a name and password
3. Wait for the project to finish setting up (~2 minutes)
4. Go to **SQL Editor** → click **New Query**
5. Paste the contents of `supabase-setup.sql` and click **Run**
6. Go to **Settings** → **API** and copy:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

**Optional: Enable Google Sign-In**

7. Go to **Authentication** → **Providers** → **Google**
8. You'll need a Google OAuth Client ID — follow the instructions in the SQL file comments
9. Add the redirect URI from Supabase to your Google Cloud Console

### Step 3: Deploy on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New** → **Project**
3. Import your `floor-plan-studio` repository
4. Under **Environment Variables**, add (only if you did Step 2):
   - `VITE_SUPABASE_URL` = your Project URL from Step 2
   - `VITE_SUPABASE_ANON_KEY` = your anon key from Step 2
5. Click **Deploy**
6. Wait ~60 seconds — your app is live!

Your app URL will be: `https://floor-plan-studio.vercel.app` (or your custom name)

### Step 4: Custom Domain (Optional — ~$10/year)

1. Buy a domain from [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or [Namecheap](https://namecheap.com)
2. In Vercel → your project → **Settings** → **Domains** → Add your domain
3. Update your domain's DNS as Vercel instructs (usually just adding a CNAME record)

## Cost Breakdown

| Service | Free Tier | When You'd Pay |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth/month, unlimited deploys | 1M+ monthly visitors |
| Supabase | 500MB database, 50K monthly users | 10K+ active users |
| Domain | N/A (use `.vercel.app` for free) | ~$10/year for custom domain |

**Total: $0/month** for a side project with moderate traffic.

## Project Structure

```
floor-plan-studio/
├── index.html              # Entry HTML with fonts
├── package.json            # Dependencies
├── vite.config.js          # Vite build config
├── supabase-setup.sql      # Database migration (run once)
├── .env.example            # Environment variables template
├── .gitignore
├── README.md
└── src/
    ├── main.jsx            # React mount point
    ├── App.jsx             # Auth wrapper + storage injection
    ├── Auth.jsx            # Optional sign-in UI (email/Google)
    ├── supabase.js         # Supabase client setup
    ├── storage.js          # Storage abstraction (localStorage + Supabase)
    └── FloorPlanStudio.jsx # The entire editor application
```

## How Storage Works

The app uses a two-layer storage system:

1. **Guest mode (no account):** Everything saves to `localStorage` with the prefix `fps_`. Data persists in the browser but doesn't sync across devices.

2. **Signed-in mode:** Data saves to both `localStorage` (for instant access) and Supabase (for cloud sync). On first sign-in, all existing local data automatically migrates to the cloud.

All data is stored as JSON strings with two key patterns:
- `fp-index` — Array of project metadata (id, name, dimensions)
- `fp-proj-{id}` — Full project data (floors, rooms, elements)

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **SVG** — All plan rendering (rooms, walls, doors, windows, columns)
- **Supabase** — Authentication and PostgreSQL database (optional)
- **Vercel** — Hosting and CDN (optional, any static host works)

## License

MIT — free to use, modify, and distribute.
