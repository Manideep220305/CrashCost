Frontend Documentation – InsureVision3
======================================

Audience: **3rd year B.Tech CSE student**, intermediate MERN developer.

Goal: After reading this file, you should be able to **mentally simulate the entire frontend**, know which file to open for any feature, and feel confident adding new pages or UI.

---

1) Big Picture – What the Frontend Does
---------------------------------------

The frontend is a **React + Vite single-page application** that talks to the backend and shows:

- A **Landing page** (marketing + portfolio).
- A **Dashboard** where a logged-in user:
  - Enters vehicle + incident details.
  - Uploads photos.
  - Triggers AI analysis and sees the damage report.
- An **Analytics page** that:
  - Shows claim history.
  - Displays AI statistics (charts).
  - Lets the user chat with AI about a specific claim.
- An **XAI Lab page** that:
  - Provides a full chat interface to ask Gemini questions about any claim.

It also handles:
- **Authentication** (login / register using JWT).
- **Dark / light mode** (ThemeContext).
- A consistent **layout** (sidebar, headers, navigation).

---

2) How the Frontend Starts Up
-----------------------------

### 2.1 `index.html`

In `frontend/index.html`:
- There is a `<div id="root"></div>` element.
- Vite injects your bundled React code here.

### 2.2 `src/main.jsx`

This file is the **entry point** for React:
- It imports React, ReactDOM, and `App`.
- It calls `ReactDOM.createRoot(document.getElementById('root'))`.
- It renders `<App />` inside `StrictMode`.

Think of this as:  
**“Start React, and draw whatever `<App />` wants to show.”**

### 2.3 `src/App.jsx`

`App.jsx` sets up **global providers** and **routing**:

- Wraps children with:
  - `<ThemeProvider>` – handles dark/light theme.
  - `<AuthProvider>` – handles authentication state.
- Wraps everything in `<Router>` (React Router).
- Defines routes:
  - `/` → `LandingPage`
  - `/dashboard` → `DashboardPage`
  - `/analytics` → `AnalyticsPage`
  - `/xai-lab` → `XaiLabPage`
  - `*` → `LandingPage` (fallback for unknown URLs)

When the URL changes, React Router decides which **page component** to render.

---

3) Folder Structure (Frontend)
------------------------------

Inside `frontend/src`:

- `main.jsx` – React entry.
- `App.jsx` – Routing + global providers.
- `index.css` – Global styles (Tailwind base + custom styles).
- `context/`
  - `AuthContext.jsx` – Authentication logic and global state.
  - `ThemeContext.jsx` – Dark/light theme logic.
- `pages/`
  - `landingPage.jsx` – Landing / marketing page.
  - `dashboardPage.jsx` – Claim wizard + AI analysis.
  - `analyticsPage.jsx` – Real claim analytics + history.
  - `xaiLabPage.jsx` – Explainable AI (Gemini) chat.
- `components/`
  - `Sidebar.jsx` – Left navigation used by authenticated pages.
  - `Navbar.jsx` – Landing page navbar.
  - `AuroraBackground.jsx` – Background visuals.
  - `AuthModal.jsx` – Login/register modal.
  - `ui/glowing-effect.jsx` – Glowing border effect.
- `controllers/`
  - `useApi.js` – Custom React hook to call APIs with loading/error state.
- `services/`
  - `api.js` – Small wrapper around `fetch` for JSON APIs.
- `lib/`
  - `utils.js` – Utility helpers (like `cn` for classNames).
- `assets/`
  - Images, logos, and other static assets.

At the root of `frontend/`:

- `vite.config.js` – Vite configuration (including `/api` proxy).
- `tailwind.config.js` – Tailwind setup + custom animations.
- `postcss.config.js` – Tailwind + Autoprefixer.
- `eslint.config.js` – Linting rules.

---

4) Global Contexts – Auth and Theme
-----------------------------------

### 4.1 ThemeContext – Dark / Light Mode

File: `src/context/ThemeContext.jsx`

What it does:
- Stores current theme: `"light"` or `"dark"`.
- Provides `toggleTheme()` to switch between them.
- Applies/removes class `dark` on the `<html>` tag.
- Saves the choice to `localStorage` so refresh doesn’t reset it.

How it affects UI:
- Tailwind is configured with `darkMode: 'class'`.
- Any class like `dark:bg-slate-950` is only applied when `<html>` has class `dark`.

### 4.2 AuthContext – Login / Logout / Register

File: `src/context/AuthContext.jsx`

State:
- `user` – current logged-in user (`{ _id, name, email, token, ... }`).
- `token` – JWT string.
- `loading` – whether an auth request is in progress.
- `error` – last auth error message.

On app start:
- Reads `user` and `token` from `localStorage`.
- If both exist:
  - Sets state.
  - Sets `axios.defaults.headers.common['Authorization'] = "Bearer <token>"`.

Functions exposed:
- `login(email, password)`:
  - Calls `POST /api/auth/login`.
  - On success:
    - Stores user + token in state and `localStorage`.
    - Updates Axios default header.
- `register(name, email, password)`:
  - Calls `POST /api/auth/register`.
  - On success: same handling as login.
- `logout()`:
  - Clears state.
  - Removes `user` + `token` from `localStorage`.
  - Deletes Axios default header.

How pages use it:
- Hooks: `const { user, login, register, logout, loading, error } = useAuth();`
- Protecting routes:
  - If `!user` → `<Navigate to="/" replace />`.
- Showing user name / first letter in avatars.

---

5) Page-by-Page Explanation
---------------------------

### 5.1 Landing Page (`src/pages/landingPage.jsx`)

Purpose:
- First impression / marketing page.
- Explains what CrashCost does.
- Encourages the user to log in and “Try the AI”.

Main sections:
- **Navbar**:
  - Logo + links.
  - Login / Register button (opens `AuthModal`).
  - Theme toggle.
- **Hero / Damage Simulation**:
  - Interactive UI where clicking changes “damage level” and visual.
  - Shows different estimated costs.
- **Under-the-hood section**:
  - Cards explaining YOLO, CLIP, XGBoost/CatBoost, SHAP.
- **How it works**:
  - Step-by-step explanation: Upload → AI detection → Cost estimate → Explainable AI.
- **Footer**:
  - Links and extra details.

Important point:  
The landing page **does not** call the backend API for real damage analysis. It’s mostly UI + explanation + auth entry point.

### 5.2 Dashboard Page (`src/pages/dashboardPage.jsx`)

Purpose:
- Main **claim submission flow** and **AI results**.

Key ideas:
- Uses a custom hook `useMockStore` to manage:
  - **Wizard step** (`currentStep`).
  - **Form data** (`vehicleDetails`, `incidentDetails`).
  - **Uploaded images**.
  - **AI `reportResult`** and `currentClaimId`.

Wizard steps:
1. **VehicleDetailsStep**
   - Inputs for brand/make, model, tier, segment, age, damage location, VIN, market value.
   - Updates `claimData.vehicleDetails`.
2. **IncidentDetailsStep**
   - Inputs for date and description.
   - Updates `claimData.incidentDetails`.
3. **ImageUploadStep**
   - Lets user upload multiple images.
   - Stores:
     - `preview` – URL for on-screen display.
     - `rawFile` – original `File` object to send to backend.
4. **ReviewStep**
   - Shows a brief summary of selected values and number of images.
5. **Analyze / Results Step**
   - If analysis not started yet → shows `SubmitStep` (“Analysis Initiated”).
   - After AI returns → shows `AssessmentReport`.

Network call (core part):
- Function `handleAnalyze`:
  - Creates `FormData`.
  - Adds `image` (first uploaded image).
  - Adds `vehicleDetails` and `incidentDetails` as JSON strings.
  - Reads `token` from `localStorage`.
  - Calls:
    - `fetch('/api/segment-car', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: formData })`.
  - Parses response JSON:
    - On `success: true`:
      - `setReportResult(data.report);`
      - `setCurrentClaimId(data.claimId);`
      - Moves wizard to step 5.
    - Otherwise shows an alert with error details.

AI loading UX:
- While `handleAnalyze` is in progress:
  - `isProcessing` flag shows a spinner and rotating status texts like:
    - “Initializing YOLOv11 Segmentation…”
    - “Running XGBoost Cost Estimation…”
    - “Generating Gemini XAI Reasoning…”

`AssessmentReport`:
- Receives `data = { report, claimId }`.
- Computes:
  - `totalEstimate`, `estimateRange`, `detections`.
- Renders:
  - **Header**: report ID, total estimate, range.
  - **Uploaded image preview**.
  - **Overview stats**: number of detections, average confidence, damage location.
  - **Per-detection cards** with:
    - Severity, label, price, summary, confidence, surface, ratio, SHAP drivers.
  - Buttons:
    - “Explain Logic” → navigate to `/xai-lab?claimId=<claimId>`.
    - “New Claim” → reloads page to reset everything.

Route protection:
- At the top of the component:
  - If `!user` from `useAuth()`, returns `<Navigate to="/" replace />`.

### 5.3 Analytics Page (`src/pages/analyticsPage.jsx`)

Purpose:
- Show **history** and **statistics** of previous claims.

Data loading:
- On mount:
  - `fetch(`/api/claims?userId=${user._id || user.id}`)`.
  - Saves the result into `claims` state.
- Loading state:
  - While loading, shows a centered spinner.
- Empty state:
  - If there are 0 claims after loading:
    - Shows a friendly message + button to go to `/dashboard`.

Computed stats:
- `totalClaims` – length of `claims`.
- `allDetections` – all `claim.aiReport.detections` flattened.
- `avgConfidence` – average detection confidence.
- `totalCost` – sum of all `claim.aiReport.total_estimate`.
- `damageChartData` – counts per damage label for bar chart.
- `severityChartData` – counts per severity for pie chart.

Visuals:
- Uses `recharts` for:
  - Bar chart (damage distribution).
  - Pie chart (severity distribution).
- Uses `framer-motion` for smooth fade-in animations.

Claim history table:
- For each claim:
  - Shows basic info (brand, model, date/time, detections count, confidence, estimate).
  - Buttons:
    - **Report**:
      - Expands inline section showing detection cards (summary of AI report).
    - **Ask AI**:
      - Opens an inline Gemini chat box for that specific claim.

Inline “Ask AI”:
- Has:
  - Text input for question.
  - “Send” button.
  - Quick question suggestion chips.
  - Area to show the AI’s answer.
- When sending:
  - Calls `POST /api/explain` with `{ claimId: aiChatClaim, message: aiQuestion }`.
  - Displays `data.answer` from backend.

Route protection:
- Same pattern: if `!user`, redirect to `/`.

### 5.4 XAI Lab Page (`src/pages/xaiLabPage.jsx`)

Purpose:
- Provide a more “lab-like” chat interface to explore AI reasoning about a claim.

Initial state:
- Reads `claimId` from URL query:
  - `const initialClaimId = searchParams.get('claimId');`
- Chat array starts with one AI message:
  - If `initialClaimId` present:
    - Introduces itself and says it loaded that claim.
  - Else:
    - Asks user to select a claim.

Loading claims:
- On mount:
  - `fetch(`/api/claims?userId=${user._id || user.id}`)`.
  - Stores in `claims`.
- Maintains:
  - `selectedClaimId` and `selectedClaim`.
- When the dropdown value changes:
  - Updates `selectedClaimId`.
  - Finds full `selectedClaim` from `claims`.
  - Pushes a new AI message summarizing the new claim.

Chat flow:
- User types question into input.
- On send:
  - If no `selectedClaimId`:
    - Adds AI message: “Please select a claim first…”.
  - Else:
    - Adds the user message to chat.
    - Sends `POST /api/explain` with `{ claimId: selectedClaimId, message }`.
    - On success: appends `data.answer` as AI message.
    - Shows a small “Gemini is thinking…” loading bubble while waiting.

Right-hand context panel:
- When `selectedClaim` exists:
  - Shows:
    - Vehicle brand + model.
    - Tier, segment, location.
    - Total estimate.
    - List of detections:
      - Label, severity, confidence, price.
  - Also shows “What to ask” suggestions.

Route protection:
- Same: if `!user`, redirect to `/`.

---

6) Shared Layout and Reusable Components
----------------------------------------

### 6.1 Sidebar (`src/components/Sidebar.jsx`)

Used on:
- Dashboard
- Analytics
- XAI Lab

Responsibilities:
- Provide left navigation with icons for:
  - Dashboard (`/dashboard`)
  - Analytics (`/analytics`)
  - XAI Lab (`/xai-lab`)
- Provide:
  - Theme toggle (dark/light).
  - Logout button (calls `logout()` from `AuthContext`).

Think of it as the **“app shell”** when you are inside the logged-in area.

### 6.2 Navbar (`src/components/Navbar.jsx`)

Used on:
- Landing Page (public area).

Responsibilities:
- Show logo and top navigation links.
- Show buttons for:
  - “Login” / “Get Started”.
  - Which open `AuthModal`.
- Show theme toggle.

### 6.3 AuthModal (`src/components/AuthModal.jsx`)

Responsibilities:
- Wraps a login/register form inside a nice modal.
- Uses Radix UI Dialog under the hood.
- Talks to `AuthContext`:
  - `login(email, password)` or
  - `register(name, email, password)`.
- Shows:
  - Loading states.
  - Error messages if login/register fails.
- After success:
  - Closes modal.
  - Redirects to `/dashboard`.

### 6.4 AuroraBackground and Glowing Effect

- `AuroraBackground.jsx`:
  - Handles 3D / gradient / animated background for landing.
  - Built using `@react-three/fiber` and related libraries.
- `components/ui/glowing-effect.jsx`:
  - Reusable component that adds a glowing border effect when the mouse moves over cards.
  - Used by high-level cards / sections for visual polish.

---

7) Styling System (Tailwind + Custom CSS)
-----------------------------------------

### 7.1 Tailwind setup

Files:
- `tailwind.config.js`:
  - `darkMode: 'class'`.
  - `content` paths include `index.html` and all `src/**/*.{js,jsx,ts,tsx}`.
  - Extends theme with:
    - Custom animations (`aurora`, `float`, `glow-pulse`, etc.).
- `postcss.config.js`:
  - Uses `tailwindcss` and `autoprefixer`.
- `src/index.css`:
  - Imports Tailwind base, components, utilities.
  - Defines global styles:
    - Base font families.
    - Some custom CSS variables for colors and effects.

How components use it:
- Mostly via Tailwind utility classes in JSX:
  - Layout: `flex`, `grid`, `gap-4`, `p-6`, `rounded-2xl` etc.
  - Colors: `bg-slate-50`, `text-slate-900`, `dark:bg-slate-950`.
  - Effects: `backdrop-blur-xl`, `shadow-lg`, `transition-all`.

### 7.2 Animations

Used libraries:
- **Framer Motion**:
  - For smooth mounting/unmounting of sections and cards.
  - Common patterns:
    - `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`.
    - `AnimatePresence` to animate components leaving.
- **CSS keyframes** (from Tailwind config):
  - Background gradients slowly moving.
  - Floating effects on cards.

---

8) API Communication on the Frontend
------------------------------------

### 8.1 How API URLs work in development

In `vite.config.js`:
- There is a dev server proxy:
  - `proxy: { '/api': 'http://localhost:5000' }`.

This means:
- In dev, when frontend calls `fetch('/api/segment-car')`, Vite forwards the request to `http://localhost:5000/api/segment-car` (the backend).
- You **do not** have to hardcode full backend URLs inside components for dev.

### 8.2 Where API calls are made

Main flows:
- Dashboard:
  - `POST /api/segment-car` via `fetch` with `FormData` + JWT in `Authorization` header.
- Analytics:
  - `GET /api/claims?userId=...` via `fetch`.
  - `POST /api/explain` for inline “Ask AI” chat.
- XAI Lab:
  - `GET /api/claims?userId=...` via `fetch`.
  - `POST /api/explain` for main chat.
- Auth:
  - `POST /api/auth/login`, `POST /api/auth/register` via `axios` in `AuthContext`.

Optional utilities:
- `services/api.js` + `controllers/useApi.js` can be used to:
  - Centralize base URL logic (using `VITE_API_URL`).
  - Centralize error handling and loading states.
  - Currently only used by the `TestApi` component.

### 8.3 Adding a new API call (mental model)

Example: Suppose you add a new backend route `GET /api/profile`.

Front-end steps:
1. Decide where you need the data (which page/component).
2. In that React component:
   - Use `useEffect` to call the API on mount:
     - `const res = await fetch('/api/profile', { headers: { Authorization: 'Bearer ' + token } });`
3. Parse JSON, update local state, and render UI accordingly.
4. Or, if using `API` helper:
   - `const data = await API.get('/profile');`

---

9) How to Extend or Modify the Frontend
---------------------------------------

Here is how you, as an intermediate MERN student, can safely extend this frontend.

### 9.1 Add a new page

1. Create a new file under `src/pages/`, e.g. `profilePage.jsx`.
2. Export a React component from it.
3. Import it into `App.jsx` and add a `<Route path="/profile" element={<ProfilePage />} />`.
4. Optionally:
   - Add a button or link in `Sidebar.jsx` or `Navbar.jsx` to navigate to `/profile`.

If the page must be protected:
- Use `const { user } = useAuth();` and redirect if `!user`.

### 9.2 Add a new item to the wizard

If you want another step in the dashboard wizard:
1. Modify `useMockStore` to include new data in `claimData`.
2. Create a new step component (similar to `VehicleDetailsStep`).
3. Insert it into the `steps` array with a new `id` and `label`.
4. Adjust logic in `handleNext` / `handleBack` if needed.

### 9.3 Connect a new backend endpoint

If backend provides `GET /api/claims/:id/details`:
1. Add a function to call that endpoint using `fetch` or `API.get`.
2. Decide where in the UI you show the extra data (e.g. deeper details in Analytics).
3. Update JSX to render that extra information once it’s loaded.

---

10) Summary – Mental Model of the Frontend
------------------------------------------

If you have to remember just **three things**:

1. **App structure**
   - `main.jsx` → `App.jsx` → Routes → Pages.
   - `ThemeProvider` and `AuthProvider` wrap everything.
2. **State and data flow**
   - Auth state lives in `AuthContext`.
   - Theme state lives in `ThemeContext`.
   - Each page manages its own local form and view state.
   - API calls go to `/api/...` and are handled by the backend.
3. **Key user journeys**
   - **Landing → Login → Dashboard** → user submits a claim → sees AI report.
   - **Dashboard → Analytics** → sees claim history, stats, and inline AI chat.
   - **Dashboard/Analytics → XAI Lab** → deeper “chat with Gemini” about a specific claim.

With this understanding, you should be able to open any frontend file and immediately see **where it fits** in the bigger picture. 

