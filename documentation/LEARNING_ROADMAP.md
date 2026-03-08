InsureVision3 – Learning Roadmap (Simple Steps)
==============================================

Audience: **You – 3rd year B.Tech CSE, intermediate MERN**  
Goal: Help you **understand + practice** this project in the right order so you become very strong with it.

You do **not** have to finish everything in one day. Think of this as a **2–4 week roadmap**.

---

Phase 0 – Setup and Orientation (Day 1)
---------------------------------------

**Goal:** Get the project running and know where things are.

1. **Run the backend**
   - Go to `backend/`.
   - Install packages: `npm install`.
   - Create `.env` and set:
     - `PORT=5000`
     - `MONGO_URI=<your MongoDB string>`
     - `JWT_SECRET=<any random string>`
     - `GEMINI_API_KEY=<your Gemini key>` (optional at first).
   - Run: `npm run dev`.

2. **Run the frontend**
   - Go to `frontend/`.
   - Install packages: `npm install`.
   - Run: `npm run dev`.
   - Open `http://localhost:5173` in browser.

3. **Read high-level docs (fast)**
   - Skim `PROJECT_DOCUMENTATION.md` once.
   - Don’t try to memorize; just get a **feeling** for the architecture.

Outcome: You can open the app, click around, and you know **which folder is frontend** and **which is backend**.

---

Phase 1 – Frontend Understanding (Days 2–4)
-------------------------------------------

**Goal:** Be comfortable with all React pages and how they talk to the backend.

1. **Understand how the app starts**
   - Open and read:
     - `frontend/src/main.jsx`
     - `frontend/src/App.jsx`
   - Make sure you understand:
     - How routes are defined.
     - How `ThemeProvider` and `AuthProvider` wrap the app.

2. **Study global contexts**
   - Read `frontend/src/context/AuthContext.jsx` carefully.
     - How `login`, `register`, `logout` work.
     - How `localStorage` and Axios default headers are used.
   - Read `frontend/src/context/ThemeContext.jsx`.
     - How theme is stored and how the `dark` class is applied.

3. **Deep dive into each page**
   - Follow `FRONTEND_DOCUMENTATION.md` section by section:
     - `LandingPage` → Understand the marketing and AuthModal usage.
     - `DashboardPage` → Pay special attention to:
       - `useMockStore` (wizard state).
       - `handleAnalyze` (FormData + fetch to `/api/segment-car`).
       - `AssessmentReport` (how it reads `report` + `claimId`).
     - `AnalyticsPage` → See how:
       - `/api/claims` is called.
       - Stats and charts are computed.
       - Inline “Ask AI” chat is wired to `/api/explain`.
     - `XaiLabPage` → See:
       - How `claimId` is read from URL.
       - How chat history is stored.
       - How `/api/explain` is used.

4. **Trace one full frontend flow**
   - Start at `LandingPage`:
     - Open Auth modal, log in.
   - Go to `Dashboard`:
     - Fill form + upload image (you can use dummy image).
     - Click Analyze.
   - Watch console logs in browser DevTools and React code:
     - Follow where `handleAnalyze` is called.
     - See where response comes back and how `AssessmentReport` is shown.

Outcome: You can explain “when I click this button, which React component runs and which backend URL is called?” for all main actions.

---

Phase 2 – Backend Understanding (Days 5–7)
------------------------------------------

**Goal:** Be comfortable with Express routes, controllers, models, and AI calls.

1. **Study server startup**
   - Read `backend/server.js` slowly.
   - Understand:
     - How Express is created.
     - How `cors`, JSON parsing, and Multer are set up.
     - How MongoDB is connected (`MONGO_URI`).
     - How `authRoutes` and `claimRoutes` are mounted.
     - What `/healthz` does.

2. **Understand models**
   - Open `backend/models/User.js`:
     - Note fields and timestamps.
   - Open `backend/models/Claim.js`:
     - Carefully read all fields in `vehicleDetails`, `incidentDetails`, `aiReport`.
     - Try to connect each field to what you see in the frontend UI.

3. **Understand auth**
   - Read `backend/controllers/authController.js`:
     - How `registerUser` and `loginUser` work.
     - How `generateToken` works.
   - Read `backend/routes/authRoutes.js`.
   - Read `backend/middleware/authMiddleware.js`:
     - How JWT is read and verified.
     - How `req.user` is attached.

4. **Understand claim analysis + AI**
   - Read `backend/controllers/claimController.js`:
     - `analyzeClaim` – follow **every step**:
       - Validate file.
       - Parse form JSON.
       - Read file from disk.
       - Build FormData for Hugging Face.
       - Call FastAPI.
       - Save `Claim` in Mongo.
       - Return `claimId` + `report`.
     - `explainClaim` – how it:
       - Loads the claim.
       - Builds a Gemini prompt.
       - Returns natural-language `answer`.
     - `getAllClaims`, `getClaimById`.
   - Read `backend/routes/claimRoutes.js`:
     - Map each route → controller.

5. **Study Gemini config**
   - Read `backend/config/gemini.js`:
     - How the keys are loaded.
     - How `getNextGeminiModel` rotates between keys.

Outcome: You can explain “when the frontend calls `/api/segment-car`, which files on the backend run, and what they do step-by-step?”

---

Phase 3 – Connect Frontend and Backend in Your Head (Days 8–9)
--------------------------------------------------------------

**Goal:** See the **full data flow** clearly.

1. **Re-read `PROJECT_DOCUMENTATION.md`**
   - Now that you’ve seen the code, this document will make more sense.
   - Focus on:
     - Section about **Main User Journeys**.
     - Section about **How frontend and backend agree on data**.

2. **Draw your own diagram**
   - On paper or in a notebook:
     - Draw boxes for:
       - Landing → Dashboard → Analytics → XAI Lab.
       - Backend routes.
       - MongoDB.
       - Hugging Face.
       - Gemini.
     - Draw arrows showing:
       - Which endpoint each page calls.
       - What data moves along that arrow (e.g. `FormData(image, vehicleDetails, incidentDetails)`).

3. **Trace two full journeys with code open**
   - Journey A: **Submit new claim**
     - Start at `DashboardPage.jsx` → `handleAnalyze` → `claimRoutes` → `analyzeClaim` → `Claim` model → response → `AssessmentReport`.
   - Journey B: **Ask AI in XAI Lab**
     - Start at `XaiLabPage.jsx` → `handleAskGemini` → `/api/explain` → `explainClaim` + `gemini.js` → response → chat UI update.

Outcome: You should be able to explain the full system to a friend without looking at the code.

---

Phase 4 – Small Practice Changes (Days 10–12)
---------------------------------------------

**Goal:** Get comfortable editing the project without breaking it.

Pick 2–3 **small, safe tasks** like:

1. **Frontend UI tweaks**
   - Change colors or text in `LandingPage`.
   - Add a new tip in the Dashboard “Quick Tips” card.
   - Add one more suggested question in XAI Lab.

2. **New read-only page**
   - Create a `HelpPage` under `src/pages/`.
   - Add route `/help` in `App.jsx`.
   - Show simple text: how to use the app, what AI does, etc.
   - Link to it from `Navbar` or `Sidebar`.

3. **Show more claim info in Analytics table**
   - In `analyticsPage.jsx`, add one more column:
     - Example: show `vehicleDetails.damageLocation`.
   - Make sure it still looks good on mobile.

Each time:
- Make a change.
- Run frontend + backend.
- Manually test in the browser.

Outcome: You gain **confidence** that you can touch the code and understand what is happening.

---

Phase 5 – Medium Features (Days 13–18)
--------------------------------------

**Goal:** Build features that use both frontend and backend logic.

Choose 1–2 of these:

1. **Protect more backend routes with auth**
   - Currently `/api/claims` and `/api/explain` are not protected.
   - Add `authMiddleware` to these routes in `claimRoutes.js`.
   - On frontend, make sure `Authorization` header is set for these requests (using `AuthContext` / `axios` or `fetch` + token).

2. **Add a “My Profile” page**
   - Backend:
     - Add `GET /api/me` that:
       - Uses `authMiddleware`.
       - Returns current user from `req.user`.
   - Frontend:
     - Add `ProfilePage` that calls `/api/me` and shows:
       - User name, email.
       - Number of claims (maybe reuse `/api/claims?userId=`).

3. **Better error handling on frontend**
   - In `DashboardPage`, if `/api/segment-car` fails:
     - Show a nice error card instead of just `alert`.
   - In Analytics/XAI Lab:
     - If `/api/claims` fails, show a “Server offline” message.

Outcome: You practice **full-stack changes**: touching models/controllers/routes + React pages/components.

---

Phase 6 – Advanced / Portfolio Upgrades (Optional, Days 19+)
------------------------------------------------------------

**Goal:** Turn this into a “killer” portfolio project.

Some ideas:

1. **PDF export of AI report**
   - Frontend:
     - Add a button “Download Report as PDF” in `AssessmentReport`.
   - Use a library (like `jspdf`) or call a backend endpoint that returns a PDF.

2. **Admin view**
   - Add a `role` field to `User` (`user` / `admin`).
   - Create an admin-only route:
     - `GET /api/admin/claims` (all claims).
   - Create an `AdminDashboard` on frontend showing:
     - All claims.
     - Filter by user, date range, severity, etc.

3. **Better security and data ownership**
   - Ensure a normal user can **only** access their own claims on the backend:
     - For `/api/claims`, ignore `userId` from query and use `req.user.id` instead.
   - Hide any sensitive data from responses.

4. **Testing**
   - Add Jest tests / supertest integration tests for:
     - Auth routes.
     - Claim routes (mocking HF and Gemini).

Outcome: These upgrades impress interviewers and give you deeper backend + system-design confidence.

---

How to Use This Roadmap
-----------------------

- Don’t rush. Even if you stretch it over **a month**, it’s okay.
- Focus on **understanding**, not just reading:
  - After each phase, try to **explain the system out loud** or on paper.
- Use the other docs as your reference:
  - `PROJECT_DOCUMENTATION.md` → big picture.
  - `FRONTEND_DOCUMENTATION.md` → React-side details.
  - `BACKEND_DOCUMENTATION.md` → Node/Express/Mongo/AI details.

If you follow this roadmap, by the end you will:
- Understand a real **production-style** MERN + AI system front-to-back.
- Be able to **confidently modify and extend** the project.
- Be ready to **talk about this project** in interviews like a strong engineer.

