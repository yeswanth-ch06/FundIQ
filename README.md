# AI-Powered Startup & Innovation Funding Intelligence Platform

A MERN-stack platform connecting founders, researchers, investors, incubators,
accelerators, government schemes, and universities — with AI-driven proposal
evaluation and funding matchmaking.

## Status: Phase 5 complete

**Phases 1–4** shipped auth, dashboards, the startup/proposal/funding
modules, the investor portal, messaging, and application tracking.
**Phase 5** (this update) adds:

- **Government Portal** — publish grant schemes, view applications against
  each scheme, approve/reject
  (`server/controllers/grantController.js`, `client/src/pages/government/`)
- **University Portal** — browse student-owned startups, send mentorship
  feedback, view student-startup analytics
  (`server/controllers/universityController.js`, `client/src/pages/university/`)
- **Admin Panel** — manage users (search, change role, suspend/activate),
  oversee and remove startups, platform-wide reports, and an audit log of
  every admin action
  (`server/controllers/adminController.js`, `client/src/pages/admin/AdminPanel.jsx`)
- **Incubator/Accelerator API** — profile CRUD and public browse endpoints
  exist (`server/controllers/incubatorController.js`); there's no dedicated
  frontend page for this role yet — see **Known gaps** below.
- **Deployment config** — `client/vercel.json` (SPA rewrite) and
  `render.yaml` (backend blueprint), plus a fix for a real cross-domain bug:
  the refresh-token cookie was `sameSite: "strict"` and the API client had a
  hardcoded `/api` base path, both of which only work when frontend and
  backend share an origin. Production now uses `sameSite: "none"` +
  `secure: true` for the cookie and a `VITE_API_URL` env var for the API
  base — see **Deployment** below.

This closes out the original 5-phase roadmap. See **Known gaps** for what's
still stubbed or missing before this is a finished product.

### Known gaps

- **Incubator/Accelerator role has no dedicated portal page.** The backend
  (`incubatorRoutes.js`) supports profile management and public browsing,
  but nothing in the sidebar or routing surfaces it yet.
- **Government/University dashboard stats are partially scoped.**
  `applicationsToMyGrants` in the government dashboard branch counts *all*
  grant applications platform-wide, not just this government user's grants
  — same simplification noted for investors in Phase 3. Fixing this means
  joining `Application` to `Grant.postedBy` directly rather than filtering
  by `opportunityModelName` alone.
- **No automated tests.** Everything here has been syntax-checked and
  import-verified, but there's no Jest/Vitest suite. Worth adding before
  this goes to production.
- **Messaging is poll-based, not WebSocket-based** (see Phase 4 notes) —
  fine for a dashboard inbox, not real "real-time."

### AI provider: Gemini, not OpenAI

The proposal evaluation feature (Phase 3) runs on **Google Gemini**
(`gemini-2.5-flash` via `@google/genai`), not OpenAI. Add your key to
`server/.env`:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

Get a key at https://aistudio.google.com/apikey. Without it, proposal
*submission* still works, but "Run AI evaluation" returns a 503 with a
clear message rather than failing silently — same behavior as the earlier
OpenAI integration, just pointed at a different provider.

## Tech stack

- **Frontend**: React 18 + Vite, React Router, Redux Toolkit, Tailwind CSS,
  React Hook Form, Axios, Framer Motion, Chart.js, React Icons
- **Backend**: Node.js, Express, Mongoose, JWT, bcrypt, Multer, Cloudinary,
  express-validator, Nodemailer
- **Database**: MongoDB Atlas
- **AI**: OpenAI API (wired in Phase 3)

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env   # fill in MongoDB URI, JWT secrets, SMTP, Cloudinary, OpenAI
npm install
npm run dev             # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev              # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no
CORS config is needed locally beyond what's already in `server.js`.

### 3. MongoDB Atlas

Create a free cluster at https://www.mongodb.com/cloud/atlas, add a database
user, whitelist your IP (or `0.0.0.0/0` for development), and paste the
connection string into `server/.env` as `MONGO_URI`.

### 4. Seed mock data (optional)

To populate the database with realistic sample data instead of starting
from an empty app:

```bash
cd server
npm run seed
```

This **clears and replaces** every collection with:

- 14 users across every role (founder, entrepreneur, student, researcher,
  investor, VC, angel investor, incubator, accelerator, government,
  university, admin)
- 5 startups (including one student-owned, so the University portal has
  data to show, and one left in `draft` status to demonstrate that state),
  4 proposals — 3 evaluated with realistic mock AI scores and 1 deliberately
  left unevaluated to demonstrate that flow, 3 investor profiles, 2 funding
  opportunities, 2 grants, 2 incubator/accelerator listings, 4 applications
  spanning every status (under review / accepted / applied / rejected), 2
  investor reviews, 5 notifications, 2 message threads, 3 bookmarks, 7 days
  of platform analytics snapshots, and 1 admin log entry

Every seeded account uses the password `Password123` — e.g. log in as
`founder1@demo.io` (startup founder), `investor1@demo.io` (angel investor),
or `admin@demo.io` (admin). The script prints the full account list
and counts when it finishes. Proposals are seeded with pre-filled mock AI
evaluations (no Gemini API calls made during seeding) so the scorecards
have data immediately — clicking "Re-run evaluation" in the UI still calls
the real API if `GEMINI_API_KEY` is set.

## What's implemented in Phase 1

**Models** (`server/models/`): User, Startup, Proposal, Investor,
FundingOpportunity, Grant, Incubator, Application, Review, Notification,
Message, Bookmark, Analytics, AdminLog (audit log — admin identity lives on
`User.role`).

**Auth** (`server/controllers/authController.js`, `server/routes/authRoutes.js`):
- `POST /api/auth/register` — role-based signup, sends verification email
- `POST /api/auth/login`
- `POST /api/auth/refresh` — rotates the httpOnly refresh-token cookie
- `POST /api/auth/logout`
- `GET  /api/auth/verify-email/:token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET  /api/auth/me`
- `PATCH /api/auth/profile`

**Security**: Helmet, rate limiting, CORS with credentials, Mongo
sanitization, XSS filtering, bcrypt password hashing, express-validator on
every mutating route.

**Frontend**: Redux auth slice with silent session restore, Axios instance
with automatic access-token refresh on 401, protected/role-gated routes,
Login/Register pages, a placeholder Landing page and role-aware Dashboard
shell ready for Phase 2's real widgets.

## Roadmap

| Phase | Scope |
|---|---|
| 1 ✅ | Folder structure, models, auth |
| 2 ✅ | Landing page, full dashboards, Startup module (CRUD + file uploads), notifications |
| 3 ✅ | AI proposal evaluation (Gemini), funding recommendation engine, Investor portal |
| 4 ✅ | Messaging, application tracking |
| 5 ✅ | Government/University portals, Admin panel, deployment config |

## Dependency notes

- `nodemailer` is pinned to `^9.0.3` (patched — see GHSA advisories fixed in 9.x).
- `react-router-dom` is pinned to `^7.18.1` (v7). The app only uses
  Declarative Mode (`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`,
  `Navigate`, `Outlet`, `useNavigate`, `useLocation`, `useParams`) — all
  unchanged between v6 and v7 — so this was a version bump with no code
  changes. v7 was required because one outstanding advisory
  (GHSA-337j-9hxr-rhxg) only ever received a v7 patch, never a v6 backport.
- AI evaluation runs on **Google Gemini** (`@google/genai`, model
  `gemini-2.5-flash`), not OpenAI — the `openai` package was removed
  entirely in favor of `@google/genai`. Set `GEMINI_API_KEY` in
  `server/.env`, not `OPENAI_API_KEY`.
- `eslint`'s `brace-expansion` advisory and Vite's dev-server `esbuild`
  advisory remain open in `npm audit`. Both are dev-tooling-only issues that
  never ship in the production build; fixing them requires breaking major
  version jumps (ESLint 9→10, Vite 5→8) that aren't worth taking on until
  there's a reason to touch that tooling directly.

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. In Render, "New +" → "Blueprint" → point at your repo. Render reads
   `render.yaml` and creates the service automatically (root dir `server`,
   build `npm install`, start `npm start`).
3. Render will prompt for every env var marked `sync: false` in
   `render.yaml` — fill in `MONGO_URI`, `JWT_ACCESS_SECRET`,
   `JWT_REFRESH_SECRET`, `SMTP_*`, `CLOUDINARY_*`, and `GEMINI_API_KEY`.
   Leave `CLIENT_URL` blank for now — you'll set it after step 5.
4. Deploy. Note the resulting URL, e.g. `https://funding-platform-api.onrender.com`.

### Frontend → Vercel

5. In Vercel, "Add New" → "Project" → same repo, set **Root Directory** to
   `client`. Vercel auto-detects the Vite framework preset.
6. Add an environment variable: `VITE_API_URL` =
   `https://funding-platform-api.onrender.com/api` (your Render URL + `/api`).
7. Deploy. Note the resulting URL, e.g. `https://funding-platform.vercel.app`.

### Close the loop

8. Back in Render, set `CLIENT_URL` to your Vercel URL from step 7
   (exact match, no trailing slash — this is what the backend's CORS and
   cookie config check against) and redeploy the backend.
9. Test the full flow on the live URLs: register, verify the refresh-token
   cookie persists a session across a page reload, and confirm file uploads
   (Cloudinary) and AI evaluation (Gemini) both work in production.

If step 9's session doesn't persist, it's almost always `CLIENT_URL` not
matching the Vercel URL exactly, or `VITE_API_URL` missing the trailing
`/api`.
