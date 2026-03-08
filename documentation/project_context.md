Project Context: InsureVision3 (Current Architecture – March 2026)
==================================================================

This file is the **engineering “source of truth”** for how the InsureVision3 / CrashCost system currently works.

You should read this when you want to:
- Understand **how the whole system fits together**.
- Quickly recall **which file does what**.
- See **how data flows** from the browser → backend → AI engines → MongoDB → back to the browser.

This document is written for a **3rd year B.Tech CSE student with intermediate MERN experience**.

---

1) What This Repository Is
--------------------------

**InsureVision3** is a **full‑stack MERN-style AI application** for automobile damage claims.

At a high level:
- A driver logs in.
- They go to the **dashboard**, enter vehicle + incident details, and upload a photo.
- The backend sends this photo + metadata to a **CrashCost AI engine** hosted on Hugging Face (FastAPI).
- The AI engine returns:
  - A **total repair estimate**.
  - A **range** (min / max cost).
  - A list of **detections** (e.g. “FRONT_BUMPER_DENT, SEVERE, 92% confidence, ₹18,000”).
- The backend saves this result in **MongoDB** as a `Claim`.
- The frontend then:
  - Shows a beautiful **assessment report**.
  - Adds the claim to your **Analytics** page (history + charts).
  - Lets you open the **XAI Lab**, where Gemini explains *why* the AI predicted those damages and costs.

So the system has **three main “brains”**:
- The **CrashCost AI Engine** (YOLO + CLIP + CatBoost) on Hugging Face → does **vision + cost estimation**.
- **MongoDB** → remembers all claims, vehicles, and AI reports.
- **Gemini 2.5 Flash** → provides natural‑language **explanations** (Explainable AI).

---

2) Repository Layout (High Level)
---------------------------------

Top level of `InsureVision3/`:

- `backend/` – Node.js + Express API server
  - Handles **auth**, **claims**, **Hugging Face calls**, **Gemini calls**, and **MongoDB**.
- `frontend/` – React + Vite single-page app
  - All UI (landing, dashboard, analytics, XAI lab) + global auth and theme.
- `README.md` – Light setup notes (some structure details are generic).
- `LOGIN_INSTRUCTIONS.md` – How to run and which test credentials to use.
- `ERROR_LOG.md` – Notes from debugging earlier auth issues.
- `project_context.md` – **This file** (engineering architecture context).
- Misc:
  - `download.py`, `test_images/` – Scripts + images for generating test data.

### Backend structure

Under `backend/`:

- `server.js` – Main entry point. Creates Express app, connects MongoDB, mounts routes, sets rate limits.
- `models/`
  - `Claim.js` – Full schema for one saved damage claim.
  - `User.js` – Schema for registered users (name, email, password).
- `controllers/`
  - `claimController.js` – Business logic for:
    - `analyzeClaim` (image → HF engine → save in DB).
    - `explainClaim` (load claim → ask Gemini → explanation).
    - `getAllClaims`, `getClaimById`.
  - `authController.js` – Register & login, JWT generation, special test user fallback.
- `middleware/`
  - `authMiddleware.js` – Verifies JWT, attaches `req.user`.
- `routes/`
  - `claimRoutes.js` – `/api/segment-car`, `/api/explain`, `/api/claims`, `/api/claims/:id`.
  - `authRoutes.js` – `/api/auth/register`, `/api/auth/login`.
  - `index.js` – Simple `/test` route (currently **not** mounted in `server.js`).
- `config/`
  - `gemini.js` – Multi‑key Gemini configuration + round‑robin key rotation.
- Scripts / tools:
  - `verifyKeys.js` – CLI to test your Gemini API keys.
  - `submit_test_claims.js` – Script to log in and submit multiple sample claims.

### Frontend structure

Under `frontend/`:

- `src/main.jsx` – React entry file. Renders `<App />`.
- `src/App.jsx` – Defines all routes:
  - `/` → `LandingPage`
  - `/dashboard` → `DashboardPage`
  - `/analytics` → `AnalyticsPage`
  - `/xai-lab` → `XaiLabPage`
- `src/pages/`
  - `landingPage.jsx` – Interactive landing + marketing.
  - `dashboardPage.jsx` – Claim wizard + AI analyze + report.
  - `analyticsPage.jsx` – Real analytics from MongoDB.
  - `xaiLabPage.jsx` – Gemini XAI chat UI.
- `src/context/`
  - `AuthContext.jsx` – Global auth state (user + token, login, register, logout).
  - `ThemeContext.jsx` – Dark / light theme (adds `dark` class on `<html>`).
- `src/components/`
  - `Sidebar.jsx` – Left navigation used on dashboard/analytics/XAI pages.
  - `Navbar.jsx` – Top navbar used on landing.
  - `AuroraBackground.jsx` – 3D / animated background.
  - `AuthModal.jsx` – Radix-based login / register modal.
  - `ui/glowing-effect.jsx` – Reusable glowing border effect.
- `src/services/api.js` – API helper (fetch wrapper – currently only used by a test component).
- `src/controllers/useApi.js` – `useApi` hook around the API helper.
- `src/index.css`, `tailwind.config.js`, `postcss.config.js` – Styling system.
- `vite.config.js` – Vite config + **dev-time `/api` proxy** to the backend.

---

3) Tech Stack and Important Dependencies
----------------------------------------

### Backend (Node + Express + MongoDB + AI)

Key technologies:
- **Express** – HTTP server and routing.
- **Mongoose** – ODM to talk to MongoDB (schemas + models).
- **Multer** – Handles file uploads (`multipart/form-data`), writes to `uploads/`.
- **Axios** + **FormData** – Used to call the CrashCost **FastAPI** endpoint on Hugging Face.
- **@google/generative-ai** – Gemini SDK for XAI explanations.
- **bcryptjs** – Password hashing.
- **jsonwebtoken** – JWT-based authentication.
- **express-rate-limit** – Protects `/api/segment-car` and `/api/explain` from abuse.
- **cors**, **dotenv**, etc.

### Frontend (React + Vite + Tailwind)

Key technologies:
- **React** 19 – Component library.
- **React Router** 7 – SPA routing.
- **Tailwind CSS** – Utility-first styling.
- **Framer Motion** – Animations.
- **Lucide React** – Icon set.
- **Recharts** – Analytics charts.
- **@react-three/fiber`, `three`, `@react-three/drei`** – 3D backgrounds.

Dev tooling:
- **Vite** – Fast dev server + bundler.
- **ESLint** (flat config) – Linting for React and hooks.

---

4) End-to-End Product Flow (Step by Step)
-----------------------------------------

### 4.1 Authentication flow

1. **User opens the app** at `/`.
2. The landing page navbar can open the **Auth modal** (`AuthModal.jsx`).
3. When the user logs in or registers:
   - Frontend calls:
     - `POST /api/auth/register` with `{ name, email, password }`, OR
     - `POST /api/auth/login` with `{ email, password }`.
   - On success, the backend returns:
     - `_id`, `name`, `email`, `token` (JWT).
   - `AuthContext`:
     - Stores this `user` and `token` in **React state**.
     - Persist them to `localStorage`.
     - Sets `axios.defaults.headers.common['Authorization'] = 'Bearer <token>'`.
4. Pages that require auth (`/dashboard`, `/analytics`, `/xai-lab`) check `user` from `AuthContext`:
   - If `user` is `null`, they **redirect** to `/` using `<Navigate>`.

On the backend:
- JWTs are created in `authController.js` using `JWT_SECRET` (with a default dev secret if missing).
- `authMiddleware.js` checks `Authorization: Bearer <token>`, verifies the token, loads the user from Mongo, and attaches it to `req.user`.

### 4.2 Claim creation (Dashboard → CrashCost AI → MongoDB)

On the **Dashboard page** (`dashboardPage.jsx`):

1. The user completes a **multi-step wizard**:
   - Step 1: Vehicle details (`brand`, `model`, `tier`, `segment`, `car_age`, `car_model_val`, `damageLocation`, optional `vin`).
   - Step 2: Incident details (`date`, `description`).
   - Step 3: Upload one or more photos.
   - Step 4: Review summary.
   - Step 5: Analyze (shows spinner → then AI results).
2. For uploads:
   - React stores both:
     - A **preview URL** for the image.
     - The raw `File` object (`rawFile`).
3. When the user clicks **Analyze**:
   - `handleAnalyze` builds a `FormData`:
     - `image` → first uploaded image file (`rawFile`).
     - `vehicleDetails` → JSON string of vehicle details.
     - `incidentDetails` → JSON string of incident details.
   - It reads the JWT from `localStorage` and calls:
     - `POST /api/segment-car` with:
       - Headers: `Authorization: Bearer <token>`.
       - Body: the `FormData` (no `Content-Type` header – the browser sets it).

On the **backend** (`claimController.analyzeClaim` in `backend/controllers/claimController.js`):

1. `multer` (configured in `server.js`) has already:
   - Parsed the `multipart/form-data`.
   - Written the image to a temporary file under `uploads/`.
2. In `analyzeClaim`:
   - It validates that `req.file` is present (otherwise returns 400).
   - Parses:
     - `vehicleDetails = JSON.parse(req.body.vehicleDetails || "{}")`.
     - `incidentDetails = JSON.parse(req.body.incidentDetails || "{}")`.
   - Reads the image into memory: `fs.readFileSync(req.file.path)`.
   - Builds a new `FormData` object for the **Hugging Face FastAPI endpoint**:
     - `image` buffer with filename + mimetype.
     - `brand`, `tier`, `segment`, `location`, `age` fields, derived from `vehicleDetails`.
   - Sends this to:
     - `HF_API_URL = "https://saimanideep-crashcost-ai-engine.hf.space/api/v1/audit"`.
   - Waits for the JSON response:
     - Contains `total_estimate`, `estimate_range`, `context`, `detections`.
   - Deletes the temp file from `uploads/`.
   - Creates a new `Claim` document:
     - `userId` is set from `req.user?.id` (if auth middleware attached a user).
     - `vehicleDetails` is a copy of what the frontend sent (with some normalization).
     - `incidentDetails` as provided.
     - `aiReport` takes the fields from the HF response.
   - Saves the claim in MongoDB.
   - Returns JSON:
     - `{ success: true, message: "AI analysis complete", claimId, report }`.

Back on the **frontend**:
- The dashboard receives `{ success, claimId, report }`:
  - Stores `report` in state.
  - Stores `claimId` separately.
  - Switches to the **Assessment report** step, passing both `report` and `claimId`.
- `AssessmentReport` displays:
  - Total estimate.
  - Range.
  - Each detection with label, severity, confidence, surface, ratio, cost, SHAP drivers.
  - An **“Explain Logic”** button that navigates to `/xai-lab?claimId=<claimId>`.

### 4.3 Analytics (History + Charts)

On the **Analytics page** (`analyticsPage.jsx`):

1. The page is **protected** by auth. If `!user`, it redirects to `/`.
2. On mount, it fetches the user’s claims:
   - `GET /api/claims?userId=<user._id or user.id>`.
   - Stores the array in state.
3. It computes:
   - `totalClaims` – number of claims.
   - `allDetections` – flattening all `aiReport.detections`.
   - `avgConfidence` – average confidence across all detections.
   - `totalCost` – sum of all `aiReport.total_estimate`.
   - `damageChartData` – counts per detection label for bar chart.
   - `severityChartData` – counts per severity for pie chart.
4. It renders:
   - Top **stat cards** (total claims, avg confidence, total estimated cost).
   - **Bar chart** (damage type distribution) using Recharts.
   - **Pie chart** (severity distribution) using Recharts.
   - A **history table**:
     - Each row = one claim.
     - “Report” button expands inline to show all detections.
     - “Ask AI” button opens an inline chat box for that claim.

The **inline chat** there calls:
- `POST /api/explain` with `{ claimId, message }` and shows the Gemini answer.

### 4.4 XAI Lab (Deep Explainable AI)

On the **XAI Lab page** (`xaiLabPage.jsx`):

1. The page is **protected** by auth.
2. It reads `claimId` from the URL:
   - `const initialClaimId = searchParams.get('claimId');`
3. On mount, it loads the user’s claims:
   - `GET /api/claims?userId=<user._id or user.id>`.
4. The user can:
   - Select a claim from a dropdown.
   - Or arrive with `?claimId=...` and have it pre-linked.
5. The chat state is stored in an array of `{ role, text }` messages.
6. When the user asks a question:
   - If no claim is selected, Gemini replies with a warning message.
   - Otherwise:
     - Adds the user message to the chat.
     - Calls `POST /api/explain` with `{ claimId, message }`.
     - Appends Gemini’s answer to the chat.
7. The right panel shows:
   - A **summary of the selected claim** (vehicle, tier, segment, location, total estimate).
   - A **list of detections** with severity and confidence.
   - Suggested prompts like “Why was this classified as SEVERE?”.

On the backend (`claimController.explainClaim`):

1. Reads `{ claimId, message }` from the body.
2. Looks up the `Claim` in MongoDB.
3. Calls `getNextGeminiModel()` to get a Gemini client with the next API key.
4. Builds a rich text `prompt` using:
   - Vehicle details.
   - Incident description.
   - Total estimate and range.
   - A bullet list of detections with severity, prices, and summaries.
   - The user’s question.
5. Calls `model.generateContent(prompt)` and returns `{ answer: text }`.

---

5) Backend Architecture (Detailed)
----------------------------------

### 5.1 `backend/server.js` – App bootstrap

**Key responsibilities:**
- Load environment variables via `dotenv`.
- Create the Express app.
- Enable `cors`.
- Enable JSON + URL-encoded body parsing.
- Create and configure `uploads/` folder for Multer.
- Set up **rate limiting** for expensive endpoints.
- Connect to **MongoDB** using `MONGO_URI`.
- Mount all routes under `/api` and `/api/auth`.
- Expose `GET /healthz` for health checks.

Important points:
- Rate limiting:
  - Uses `express-rate-limit` to limit requests to `/api/segment-car` and `/api/explain`.
  - Protects the Hugging Face and Gemini quotas from being spammed.
- `app.set('trust proxy', 1)` is usually enabled in production so that rate limiting uses the real client IP behind a proxy (e.g. Render’s load balancer).
- MongoDB:
  - Uses `process.env.MONGO_URI`.
  - If the connection fails, the server logs errors; for local "student mode" the code is written to keep things as smooth as possible.

### 5.2 Models

#### Claim model (`backend/models/Claim.js`)

Defines **one document per saved claim**:

- `userId` – `ObjectId` referencing `User` (may be null for older claims).
- `vehicleDetails` – nested object:
  - `vin`: string.
  - `model`: string.
  - `year`: string.
  - `make`: string.
  - `brand`: string.
  - `tier`: `'budget' | 'mid' | 'premium' | 'luxury'`.
  - `segment`: `'hatchback' | 'sedan' | 'suv' | 'compact_suv'`.
  - `damageLocation`: `'front' | 'rear' | 'side' | 'top'`.
  - `car_model_val`: number (₹ market value).
  - `car_age`: number (years).
- `incidentDetails`:
  - `date`: `Date`.
  - `description`: string.
- `aiReport`:
  - `total_estimate`: number.
  - `estimate_range`: `[min, max]`.
  - `context`:
    - `brand`, `tier`, `segment`, `location`.
  - `detections`: array of:
    - `id`: number.
    - `label`: string (e.g. `FRONT_BUMPER_DENT`).
    - `confidence`: number (0–1).
    - `surface_detected`: string (e.g. `metal`).
    - `severity`: string (`MINOR`, `MODERATE`, `SEVERE`).
    - `ratio`: number (damage area ratio).
    - `bbox`: mixed (bounding box coordinates).
    - `price`: number (₹).
    - `drivers`: string[] (SHAP-style feature names).
    - `summary`: short explanation.
    - `narrative`: longer text.
- `status`: default `"Auto-Assessed"`.
- Timestamps: `createdAt`, `updatedAt`.

#### User model (`backend/models/User.js`)

- Fields:
  - `name`: string, required.
  - `email`: string, required, unique.
  - `password`: string, required (hashed).
- Timestamps enabled.

### 5.3 Controllers and routes

#### Auth (`backend/controllers/authController.js` + `routes/authRoutes.js`)

Endpoints:
- `POST /api/auth/register`:
  - Validates `name`, `email`, `password`.
  - Checks if the user already exists.
  - Hashes password with bcrypt.
  - Creates a new `User` in MongoDB.
  - Returns `{ _id, name, email, token }`.
  - If the DB is unavailable in “student mode”, it can still return a mock user to keep the UI working.
- `POST /api/auth/login`:
  - Special-case: `test@test.com` / `password` returns a test user with a JWT without hitting the DB.
  - Otherwise:
    - Finds the user by email.
    - Compares the password with the bcrypt hash.
    - Returns `{ _id, name, email, token }` on success.

JWT:
- `generateToken(id)` signs with `JWT_SECRET` and 30-day expiration.

#### Auth middleware (`backend/middleware/authMiddleware.js`)

- Reads `Authorization` header.
- Verifies JWT using `JWT_SECRET`.
- Loads the user by decoded `id` and assigns `req.user`.
- On error or missing token → returns 401.
- Note: If the user was deleted or is a special test user without DB record, `req.user` may end up null; controllers handle this by simply not attaching `userId` on claims.

#### Claims (`backend/controllers/claimController.js` + `routes/claimRoutes.js`)

Routes in `backend/routes/claimRoutes.js`:

- `POST /api/segment-car` – **Protected** by `authMiddleware`:
  - Uses Multer `upload.single('image')`.
  - Calls `analyzeClaim`.
- `POST /api/explain` – **Not currently protected**:
  - Calls `explainClaim`.
- `GET /api/claims` – **Not currently protected**:
  - Calls `getAllClaims` (optionally filtered by `?userId=`).
- `GET /api/claims/:id` – **Not currently protected**:
  - Calls `getClaimById`.

Business logic functions:

- `analyzeClaim(req, res)`:
  - Described in detail in section 4.2.
- `explainClaim(req, res)`:
  - Described in detail in section 4.4.
- `getAllClaims(req, res)`:
  - If `req.query.userId` is present, filter by that `userId`.
  - Otherwise return **all** claims (useful for admin / debugging).
  - Sorts by `createdAt` descending.
- `getClaimById(req, res)`:
  - `Claim.findById(req.params.id)`.
  - Returns 404 if not found.

### 5.4 Gemini config (`backend/config/gemini.js`)

Purpose: **handle Gemini API key rotation safely and simply**.

- Collects keys from:
  - `GEMINI_API_KEY`
  - `GEMINI_API_KEY_1`
  - `GEMINI_API_KEY_2`
- Filters out any that are empty / undefined.
- If **no keys are found**:
  - Logs a critical error.
  - Calls `process.exit(1)` – this prevents deploying a broken backend without keys.
- Maintains an index and defines:
  - `getNextGeminiModel()`:
    - Picks the next key in round‑robin fashion.
    - Returns a Gemini **2.5 Flash** model client configured with relaxed safety settings.

This is used only by `explainClaim` for XAI responses.

---

6) Frontend Architecture (Detailed)
-----------------------------------

### 6.1 Entry and routing

- `src/main.jsx`:
  - Renders `<App />` into `#root` using `StrictMode`.
- `src/App.jsx`:
  - Wraps the app in:
    - `<ThemeProvider>` – controls dark/light mode.
    - `<AuthProvider>` – global auth state.
  - Defines routes using React Router:
    - `/` → `LandingPage`.
    - `/dashboard` → `DashboardPage` (protected).
    - `/analytics` → `AnalyticsPage` (protected).
    - `/xai-lab` → `XaiLabPage` (protected).
    - `*` → `LandingPage` (fallback).

Each protected page uses `useAuth()` to check if `user` is present; if not, it returns `<Navigate to="/" replace />`.

### 6.2 Global contexts

#### AuthContext (`src/context/AuthContext.jsx`)

State:
- `user` – object with `_id`, `name`, `email`, `token`.
- `token` – JWT string.
- `loading`, `error`.

On first mount:
- Reads `user` and `token` from `localStorage`.
- If they exist:
  - Parses user JSON.
  - Sets Axios default `Authorization` header.

Functions:
- `login(email, password)`:
  - `POST /api/auth/login` using Axios.
  - On success:
    - Sets `user`, `token`, saves to `localStorage`, updates Axios default header.
- `register(name, email, password)`:
  - `POST /api/auth/register`.
  - On success, behaves like login.
- `logout()`:
  - Clears state and `localStorage`.
  - Deletes Axios default `Authorization`.

#### ThemeContext (`src/context/ThemeContext.jsx`)

Manages theme:
- Keeps `theme` in state.
- Toggles `theme` between `'light'` and `'dark'`.
- Adds/removes `class="dark"` on the HTML root element.
- Stores preference in `localStorage`.

### 6.3 Key pages

#### Landing page (`src/pages/landingPage.jsx`)

- Full marketing / portfolio experience:
  - Hero section with interactive “damage level” simulation.
  - Under-the-hood cards describing internal AI stack (YOLOv11, CLIP, XGBoost / CatBoost, SHAP).
  - “How it works” steps and comparison between traditional adjuster vs AI.
- Uses:
  - `Navbar` for top navigation + login/register buttons.
  - `AuroraBackground` for animated background.
  - `AuthModal` for authentication.

#### Dashboard page (`src/pages/dashboardPage.jsx`)

Described in detail in section 4.2. Highlights:
- Implements the **multi-step wizard** using:
  - `useMockStore` custom hook to store:
    - `vehicleDetails`, `incidentDetails`, `uploadedImages`, `reportResult`, `currentClaimId`.
- On submit:
  - Calls `POST /api/segment-car` with JWT token.
- Shows:
  - Animated loading screen while waiting for AI.
  - Full `AssessmentReport` once data arrives.

#### Analytics page (`src/pages/analyticsPage.jsx`)

Described in detail in section 4.3. Highlights:
- Uses **real data** from MongoDB:
  - `GET /api/claims?userId=...`.
- Builds:
  - Stat cards (total claims, avg confidence, total cost).
  - Damage-type bar chart, severity pie chart.
  - Claim history table with:
    - Expandable AI report.
    - Inline “Ask AI” chat connected to `/api/explain`.

#### XAI Lab page (`src/pages/xaiLabPage.jsx`)

Described in detail in section 4.4. Highlights:
- Dedicated **chat interface** for Explainable AI.
- Claim selector, chat history, and rich right-hand context panel.

### 6.4 Shared layout / components

- `Sidebar.jsx`:
  - Persistent left nav on dashboard/analytics/XAI pages.
  - Shows navigation icons, theme toggle, and logout.
- `Navbar.jsx`:
  - Top navbar on landing page.
  - Handles auth modal open/close and theme toggle.
- `AuroraBackground.jsx`:
  - Visual 3D/animated background using React Three Fiber.
- `AuthModal.jsx`:
  - Login/register form inside a Radix dialog.
  - Calls `login` / `register` from `AuthContext`.

### 6.5 API utilities (optional)

- `src/services/api.js`:
  - Exposes `API.get/post/put/delete` helpers.
  - Builds base URL from `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`.
- `src/controllers/useApi.js`:
  - A generic `useApi()` hook to manage `loading`, `error`, and data around API calls.
- `src/components/TestApi.jsx`:
  - Simple component to call `/test` using `useApi`.
  - Currently not part of main routing and `/test` isn’t mounted in `server.js`.

In the **main flows**, the app tends to use:
- `fetch('/api/...')` directly (benefits from Vite dev proxy).
- `axios` via `AuthContext` for auth.

---

7) Environment Variables and Deployment
---------------------------------------

### 7.1 Backend environment (`backend/.env`)

The backend expects:

- `PORT` – default is usually `5000`.
- `MONGO_URI` – MongoDB connection string (local or Atlas).
- `JWT_SECRET` – secret for signing JWTs (fallback dev value exists, but you should set a real one).
- `GEMINI_API_KEY`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2` – Gemini API keys used by `config/gemini.js`.

Note: the old `MONGODB_URI` name in some docs is **outdated**; the code uses `MONGO_URI`.

### 7.2 Frontend environment (`frontend/.env`)

Frontend supports:

- `VITE_API_URL` – optional base URL used by the `API` helper in `services/api.js`.

However, the core pages currently use **relative `/api/...` URLs** and rely on:

- Vite dev server proxy (in `vite.config.js`) during development:
  - Proxies `/api` → `http://localhost:5000`.
- In production, you normally deploy:
  - Backend on a domain like `https://your-backend.com`.
  - Frontend configured to call that backend (either by setting `VITE_API_URL` and refactoring to use the helper, or by appropriate reverse proxy rules).

### 7.3 Production notes (Render + Vercel)

While this repo is portable, it is optimized for:

- **Backend: Render**
  - Start command: `npm start` (from `backend/`).
  - Uses `process.env.PORT` provided by Render.
  - `GET /healthz` is used as a health check.
  - Rate limiting + `trust proxy` are configured for correctness behind their load balancer.
- **Frontend: Vercel**
  - Build from `frontend/`.
  - `vercel.json` includes a rewrite rule so refreshing `/dashboard` or `/xai-lab` works.

---

8) Known Gaps, Risks, and Future Work
-------------------------------------

This section is intentionally honest so you know what to improve next.

### 8.1 Security / auth gaps

- `POST /api/segment-car` is **protected** by `authMiddleware`.
- But currently:
  - `GET /api/claims`
  - `GET /api/claims/:id`
  - `POST /api/explain`
  are **not protected**.
- In a true production setup, you would usually:
  - Require JWT auth for all of them.
  - Make sure users can **only** see their own claims.

### 8.2 Routing and test utilities

- `backend/routes/index.js` defines `/test` but is **not mounted**, so:
  - `GET /api/test` will not work until you mount it in `server.js`.
- `frontend/src/components/TestApi.jsx` depends on `/test` and is not in the main route tree.

### 8.3 API helper usage

- The `services/api.js` + `useApi` combination is well-structured but not used in core flows.
- The main pages call:
  - `fetch('/api/...')` or Axios directly.
- For a more uniform codebase, you could:
  - Refactor to use `API.get/post` everywhere.
  - Centralize error handling and base URL configuration.

### 8.4 Data ownership and edge cases

- Some old claims may have:
  - No `userId` (because they were created before the auth integration).
- `authMiddleware` does not handle the case where the JWT decodes but the corresponding `User` no longer exists in DB.
- `Claim` schema trusts the `aiReport` structure from the HF engine; if that contract changes, you must update both backend and frontend code.

### 8.5 Roadmap ideas (engineering growth)

If you want to push this project into a **portfolio “killer”**:

- Add **protected** access to `/api/claims` and `/api/explain` and implement **per-user claims** only.
- Use **Clerk/Auth0** or another provider for production-grade auth.
- Add detailed **unit tests** and **integration tests** for:
  - `authController`.
  - `claimController`.
  - Frontend pages using something like Testing Library.
- Improve the `API` helper and convert all `fetch` calls to it.
- Add **PDF export** of an AI report for each claim.
- Add **performance logging** of HF + Gemini latency and display them in a “System Status” panel.

---

9) How to Use This Document
---------------------------

When you are working on this project:

- If you forget **where something lives**, come back to:
  - Section 2 (repo layout) and 5 / 6 (backend / frontend details).
- If you want to trace **a single user action**:
  - Start from section 4 (End-to-end product flow).
- If you are debugging a bug in AI / data:
  - Check section 5.3 (claim controller) and section 6.3–6.4 (dashboard / analytics / XAI Lab).
- If you are preparing for **interviews**:
  - Use this to explain your architecture clearly:
    - “We use Hugging Face FastAPI for vision + cost, Gemini for XAI, and store structured reports in MongoDB via Mongoose…”

This file should always be updated when you make **major architectural changes** so that your future self (and recruiters) can quickly understand what’s going on.

