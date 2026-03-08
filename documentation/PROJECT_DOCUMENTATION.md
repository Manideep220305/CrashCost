InsureVision3 – Full Project Documentation (Student-Friendly)
============================================================

Audience: **You – a 3rd year B.Tech CSE student**, intermediate MERN developer.

Goal: Give you a **simple but detailed mental model** of the *entire* InsureVision3 system – frontend + backend + AI – so you can:
- Explain it confidently in interviews.
- Modify it without fear.
- Extend it with new features.

If you want **maximum detail** about one side only:
- Frontend only → read `frontend/FRONTEND_DOCUMENTATION.md`.
- Backend only → read `backend/BACKEND_DOCUMENTATION.md`.
- Deeper architecture details → read `project_context.md`.

This file focuses on the **big picture** and connects everything.

---

1) One-Line Summary
-------------------

**InsureVision3** is a full-stack MERN-style app where:

> **A driver uploads crash photos → an AI engine estimates damage cost + detects parts → Gemini explains the reasoning → everything is stored and visualized in a modern React dashboard.**

---

2) High-Level Architecture
--------------------------

You can think of the project as 3 main layers:

- **Frontend (React + Vite + Tailwind)**
  - Runs in the browser.
  - Handles UI, routing, forms, charts, and talking to the backend.

- **Backend (Node + Express + MongoDB)**
  - Runs on server (e.g., Render).
  - Handles auth, file uploads, database operations, and communication with AI services.

- **External AI Services**
  - **CrashCost AI Engine** (FastAPI on Hugging Face):
    - Does vision (YOLO etc.) and cost estimation.
  - **Gemini 2.5 Flash** (Google Generative AI):
    - Explains the AI decisions in human language.

Very simple mental diagram:

> Browser (React)  
> → Express API (Node)  
> → CrashCost AI (Hugging Face) + MongoDB + Gemini  
> → back to Browser

---

3) Repository Layout – Where Things Live
----------------------------------------

At the top level (`InsureVision3/`):

- `frontend/` – All React code (pages, components, contexts).
- `backend/` – All Node/Express code (routes, controllers, models, config).
- `README.md` – Basic getting-started instructions.
- `project_context.md` – Deep engineering overview of architecture.
- `PROJECT_DOCUMENTATION.md` – **This file** (overall plain-English documentation).
- `LOGIN_INSTRUCTIONS.md` – How to log in locally and which test credentials to use.
- `ERROR_LOG.md` – Notes from previous debugging.
- `download.py`, `test_images/` – Tools to fetch and store test crash images.

Inside `frontend/`:
- `src/App.jsx` – Routes.
- `src/pages/` – Pages (`landingPage`, `dashboardPage`, `analyticsPage`, `xaiLabPage`).
- `src/context/` – `AuthContext`, `ThemeContext`.
- `src/components/` – Navbar, Sidebar, AuthModal, etc.
- `FRONTEND_DOCUMENTATION.md` – Detailed frontend docs.

Inside `backend/`:
- `server.js` – Entry point.
- `models/` – `User.js`, `Claim.js`.
- `controllers/` – `authController.js`, `claimController.js`.
- `routes/` – `authRoutes.js`, `claimRoutes.js`.
- `middleware/` – `authMiddleware.js`.
- `config/` – `gemini.js`.
- `BACKEND_DOCUMENTATION.md` – Detailed backend docs.

---

4) Main User Journeys (End-to-End)
----------------------------------

There are three core journeys:

1. **Authentication** – log in / register.
2. **Submit a new claim** – AI estimates cost and damages.
3. **Explore history & explanations** – analytics and XAI lab.

Let’s walk through each one.

### 4.1 Authentication Journey

**From the user’s view:**
1. User opens `LandingPage` (`/`).
2. Clicks **Login / Get Started** in the navbar.
3. `AuthModal` opens with login/register form.
4. After successful login:
   - User is redirected to `/dashboard`.

**What happens technically:**
1. `AuthModal` calls:
   - `login(email, password)` or
   - `register(name, email, password)` from `AuthContext`.
2. `AuthContext` sends Axios request to backend:
   - `POST /api/auth/login` or
   - `POST /api/auth/register`.
3. Backend (`authController.js`) checks credentials, hashes/compares passwords, and returns:
   - `_id`, `name`, `email`, `token` (JWT).
4. Frontend:
   - Stores user object + token in React state.
   - Saves them to `localStorage`.
   - Sets default Axios header: `Authorization: Bearer <token>`.
5. Any protected page (dashboard, analytics, XAI lab):
   - Calls `useAuth()` and checks `user`.
   - If no user, redirects back to `/`.

**Why this matters:**
- The JWT token is what lets the backend know **who is making the request**.
- This is especially important for tying claims to a specific user.

### 4.2 Claim Submission Journey

**From the user’s view:**
1. On `/dashboard`, they see a multi-step wizard:
   - Vehicle details → Incident details → Upload photos → Review → Analyze.
2. After clicking **Analyze**, a “Processing Data…” screen appears.
3. Then they see a **detailed AI assessment**:
   - Total estimated cost.
   - Range.
   - List of damaged areas with severity, confidence, and SHAP-style drivers.
4. They can click **Explain Logic** to go to `/xai-lab?claimId=...`.

**What happens technically:**

Frontend (Dashboard):
1. Wizard collects:
   - `vehicleDetails` (brand, model, tier, segment, age, damage location, etc.).
   - `incidentDetails` (date, description).
   - `uploadedImages` (with previews + raw `File` objects).
2. When user clicks analyze:
   - `handleAnalyze` creates a `FormData` object:
     - Adds the first uploaded `rawFile` as `image`.
     - Adds `vehicleDetails` and `incidentDetails` as JSON strings.
   - Reads JWT token from `localStorage`.
   - Calls:
     - `fetch('/api/segment-car', { method: 'POST', headers: { Authorization: 'Bearer <token>' }, body: formData })`.

Backend:
1. Request hits `POST /api/segment-car`.
2. Middlewares:
   - `authMiddleware`:
     - Verifies JWT.
     - Attaches `req.user = { id: ... }`.
   - `multer`:
     - Parses `multipart/form-data`.
     - Saves image file to `uploads/`.
     - Attaches `req.file`.
3. `analyzeClaim` controller:
   - Validates `req.file` exists.
   - Parses `vehicleDetails` and `incidentDetails`.
   - Reads the image from disk.
   - Builds a new `FormData` for **CrashCost FastAPI**:
     - `image`, `brand`, `tier`, `segment`, `location`, `age`.
   - Sends it to:
     - `HF_API_URL` on Hugging Face (YOLO + CLIP + CatBoost).
   - Receives a JSON response (the AI report).
   - Deletes the local temp file.
   - Creates a new `Claim` in MongoDB:
     - `userId` from `req.user.id`.
     - `vehicleDetails` and `incidentDetails`.
     - Full `aiReport` from HF.
   - Saves and returns:
     - `{ success, message: "AI analysis complete", claimId, report }`.

Frontend (Dashboard again):
1. Receives response.
2. If success:
   - Stores `report` and `claimId` in state.
   - Switches wizard to **AssessmentReport**.
3. `AssessmentReport`:
   - Displays the totals + detection cards.
   - Shows a “Explain Logic” button that **navigates to** `/xai-lab?claimId=<claimId>`.

### 4.3 Analytics and XAI Journeys

**Analytics page (`/analytics`):**

User view:
- Sees:
  - Total number of claims.
  - Average AI confidence.
  - Total estimated repair cost.
  - Bar chart of damage types.
  - Pie chart of severity distribution.
  - A table of all claims with:
    - Expandable “Report” view.
    - “Ask AI” chat per claim.

Technical:
- On mount:
  - Calls `GET /api/claims?userId=<user._id or user.id>`.
  - Uses the list of `Claim` documents to compute statistics.
  - Renders charts using `recharts`.
- Inline “Ask AI”:
  - When user asks a question about a specific claim:
    - Sends `POST /api/explain` with `{ claimId, message }`.
    - Backend loads that claim, asks Gemini, and returns `answer`.
    - Frontend displays the answer under the claim.

**XAI Lab page (`/xai-lab`):**

User view:
- A full chat-style interface.
- Can select a claim from a dropdown or come directly from the dashboard via `?claimId=...`.
- Asks open-ended questions about damage, cost, and reasoning.

Technical:
- On mount:
  - Reads `claimId` from URL.
  - Calls `GET /api/claims?userId=<user-id>` to load all claims for the dropdown.
  - Sets up initial chat message (context for Gemini).
- On each question:
  - If no claim selected → show warning.
  - Else:
    - Add user message to chat history.
    - `POST /api/explain` with `{ claimId, message }`.
    - Add Gemini’s answer to the chat.

Backend for both analytics + XAI:
- `getAllClaims`:
  - Returns all claims (optionally filtered by `?userId=`).
- `explainClaim`:
  - Loads one claim.
  - Uses `getNextGeminiModel()` to get a Gemini instance.
  - Builds a rich prompt with:
    - Vehicle details.
    - Incident summary.
    - Total estimate + range.
    - Bullet list of detections (label, severity, cost, summary).
    - User’s question.
  - Calls `generateContent` and returns the text answer.

---

5) How Frontend and Backend Agree on Data
-----------------------------------------

It’s important to understand **what shape of data** they share.

### 5.1 Claim shape (simplified)

When the frontend receives a `Claim` from the backend, it looks like:

- `vehicleDetails`:
  - `brand`, `model`, `tier`, `segment`, `damageLocation`, `car_age`, `car_model_val`, etc.
- `incidentDetails`:
  - `date`, `description`.
- `aiReport`:
  - `total_estimate`
  - `estimate_range` (2-element array)
  - `context` (`brand`, `tier`, `segment`, `location`)
  - `detections[]`:
    - `label`, `severity`, `confidence`, `surface_detected`, `ratio`, `price`, `drivers[]`, `summary`, `narrative`.

This shape is used for:
- Dashboard assessment view.
- Analytics charts.
- XAI context panel and prompts.

### 5.2 Auth shape

On login/register:
- Backend returns `{ _id, name, email, token }`.
- Frontend stores this whole object as `user` (plus `token` separately).

This is why in your React code you see things like:
- `user._id` or `user.id` (depending on how the object is passed around).

---

6) Running the Project Locally
------------------------------

### 6.1 Backend

From `InsureVision3/backend`:

```bash
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-random-secret-string>
GEMINI_API_KEY=<your-gemini-key>
# Optional extra keys:
GEMINI_API_KEY_1=<key-2>
GEMINI_API_KEY_2=<key-3>
```

Then:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 6.2 Frontend

From `InsureVision3/frontend`:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Because of Vite’s proxy:
- Frontend calls like `fetch('/api/segment-car')` are forwarded to `http://localhost:5000/api/segment-car`.

### 6.3 Test login

Check `LOGIN_INSTRUCTIONS.md` for current test credentials (e.g., dev account or special test user like `test@test.com` / `password`).

---

7) Where to Read More (Per-Layer Docs)
--------------------------------------

If you want to go **deeper**:

- **Frontend details**:
  - `frontend/FRONTEND_DOCUMENTATION.md`
  - Explains:
    - Every page.
    - Contexts.
    - Layout components.
    - How the wizard works.
    - How API calls are made.

- **Backend details**:
  - `backend/BACKEND_DOCUMENTATION.md`
  - Explains:
    - All models (User, Claim).
    - All controllers (auth, claim).
    - Routes and middleware.
    - AI integrations with Hugging Face and Gemini.

- **Architecture deep dive**:
  - `project_context.md`
  - More engineering-style view with sections on:
    - Data contracts.
    - Known risks.
    - Env/deployment notes.
    - Roadmap ideas.

---

8) How to Explain This Project in an Interview
----------------------------------------------

Here’s a template you can adapt:

- **High-level**:
  - “I built a full-stack AI insurance claims assistant using a MERN-style architecture. Drivers upload car damage photos, a Hugging Face FastAPI model estimates the repair cost and damage breakdown, and a Gemini model explains the reasoning in plain language.”

- **Frontend**:
  - “On the frontend I used React + Vite + Tailwind with React Router. There’s a multi-step dashboard wizard for vehicle + incident details and image uploads, an analytics page with Recharts visualizations of AI detections, and an XAI lab where users chat with Gemini about specific claims.”

- **Backend**:
  - “On the backend I used Node + Express + MongoDB. The backend handles JWT authentication, uses Multer to accept image uploads, sends them to a CrashCost AI engine hosted on Hugging Face, saves structured AI reports in Mongo, and exposes endpoints for history and an XAI explanation endpoint that calls Gemini 2.5 Flash.”

- **Data & AI**:
  - “Each claim stores vehicle metadata, incident details, and a detailed AI report with detections, severities, SHAP-like cost drivers, and price per damage. The frontend uses this data to build analytics and to construct prompts for Gemini so the explanations are grounded in the model’s actual output.”

- **Your role**:
  - Focus on:
    - Routing and protected routes.
    - Data flow from frontend → backend → AI → MongoDB → frontend.
    - Error handling and improvements you’d like to add.

---

9) Next Steps for You as a Developer
------------------------------------

You already have a **very strong base project**. Here are good next steps to deepen your skills:

- **Security**:
  - Protect `/api/claims` and `/api/explain` with `authMiddleware`.
  - Make sure users can only see **their own** claims on the server side.

- **Refactor API calls**:
  - Use the `services/api.js` helper everywhere for consistent base URLs and error handling.

- **New features**:
  - Add a **profile page** (`/profile`) to show user data and claim counts.
  - Add a **PDF export** of AI reports for each claim.
  - Add an **admin view** to see all claims and filter by user.

- **Testing**:
  - Add unit tests for:
    - `authController`.
    - `claimController`.
  - Add a simple integration test that:
    - Logs in.
    - Sends a fake claim (maybe mocking the HF response).
    - Verifies the DB and response shape.

If you keep this overall picture in mind and use the per-layer docs (`FRONTEND_DOCUMENTATION.md`, `BACKEND_DOCUMENTATION.md`, `project_context.md`) as references, you’ll be able to confidently **drive this project forward** like a professional engineer.

