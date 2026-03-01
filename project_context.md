# Project Context: InsureVision3

## 1) What This Repository Is
InsureVision3 is a full-stack MERN-style application for AI-assisted automobile damage claim intake and explanation.

- Frontend: React + Vite + Tailwind dashboard experience
- Backend: Express + Mongoose API server
- AI Inference: External Hugging Face Space via `@gradio/client`
- XAI Chat: Gemini API call from backend using claim context from MongoDB

The current implementation is a product prototype with strong UI polish and a real backend pipeline for claim creation and explanation.

## 2) Repository Layout
Top-level:
- `backend/`: Node/Express API + MongoDB model
- `frontend/`: React SPA
- `README.md`: high-level setup notes (partly outdated)
- `.gitignore`

Key backend files:
- `backend/server.js`: all active routes + app bootstrap
- `backend/models/Claim.js`: MongoDB schema for claim records
- `backend/routes/index.js`: test route file (currently not mounted)
- `backend/package.json`

Key frontend files:
- `frontend/src/App.jsx`: route definitions
- `frontend/src/pages/landingPage.jsx`: marketing/interactive landing
- `frontend/src/pages/dashboardPage.jsx`: claim intake wizard + AI submit/report
- `frontend/src/pages/analyticsPage.jsx`: analytics UI (mock data)
- `frontend/src/pages/xaiLabPage.jsx`: XAI chat UI linked by claimId
- `frontend/src/components/Sidebar.jsx`: shared nav
- `frontend/src/services/api.js`: generic fetch wrapper (used by test component)
- `frontend/src/controllers/useApi.js`: loading/error hook around API wrapper
- `frontend/src/components/TestApi.jsx`: simple API test component (not mounted in routes)
- Tailwind/Vite/PostCSS/ESLint config files under `frontend/`

Assets:
- Multiple PNG/JPEG assets under `frontend/src/assets/` used by UI pages.

## 3) Tech Stack and Runtime
Backend (`backend/package.json`):
- express `^4.22.1`
- mongoose `^8.23.0`
- multer `^2.1.0`
- axios `^1.13.6`
- cors `^2.8.6`
- dotenv `^16.3.1`
- `@gradio/client` `^2.1.0`
- `@google/generative-ai` `^0.24.1`
- nodemon for dev

Frontend (`frontend/package.json`):
- react/react-dom `^19.2.0`
- react-router-dom `^7.13.1`
- framer-motion `^12.34.3`
- lucide-react `^0.575.0`
- recharts `^3.7.0`
- tailwindcss `^3.4.19`
- vite `^7.3.1`

## 4) Current End-to-End Product Flow
1. User navigates to `/dashboard` and fills multi-step form:
   - Vehicle details
   - Incident details
   - Uploads image(s)
2. On analyze:
   - Frontend sends multipart form to `POST /api/segment-car`
   - Includes first uploaded file as `image`
   - Includes `vehicleDetails` and `incidentDetails` as JSON strings
3. Backend:
   - Validates file exists
   - Reads temp file and sends it to Hugging Face Space `Userabc/segmenter`
   - Downloads returned JSON report URL via axios
   - Saves full claim (form + AI report + HF URL) in MongoDB
   - Returns success payload with `claimId` and `report`
4. Frontend shows assessment screen
5. User can click “Explain Logic” to open `/xai-lab?claimId=...`
6. XAI lab posts to `POST /api/explain`
7. Backend fetches claim from MongoDB and asks Gemini to explain based on stored claim context

## 5) Frontend Architecture
### Routing (`frontend/src/App.jsx`)
Routes:
- `/` -> `LandingPage`
- `/dashboard` -> `DashboardPage`
- `/analytics` -> `AnalyticsPage`
- `/xai-lab` -> `XaiLabPage`
- fallback `*` -> `LandingPage`

### Dashboard (`frontend/src/pages/dashboardPage.jsx`)
- Contains local `useMockStore` state manager for wizard data.
- Keeps `claimData`, `reportResult`, and `currentClaimId` in component state.
- Upload handling stores both preview URL and raw File object.
- `handleAnalyze()` sends request to backend via `fetch('http://localhost:5000/api/segment-car')`.
- Has simulated loading text timeline while waiting.
- Renders `AssessmentReport` after response.

Important implementation detail:
- `setReportResult(data.report)` is called, but `AssessmentReport` expects `data` shaped like `{ report, claimId }`. This creates a data-shape mismatch where:
  - `const { report, claimId } = data` is wrong if `data` is already the report object.
  - claimId display and report field usage may be inconsistent.

### XAI Lab (`frontend/src/pages/xaiLabPage.jsx`)
- Reads `claimId` from URL query params.
- If missing claimId, disables chat and shows warning.
- Sends `POST http://localhost:5000/api/explain` with `{ claimId, message }`.
- Displays Gemini response text in chat UI.

### Analytics (`frontend/src/pages/analyticsPage.jsx`)
- Uses static mock datasets for charts and claims list.
- No backend integration currently.

### API Utility Files
- `frontend/src/services/api.js` defines base URL from `VITE_API_URL` fallback `http://localhost:5000/api`.
- Not used by dashboard/xai pages (those pages use hardcoded absolute fetch URLs).
- `frontend/src/components/TestApi.jsx` uses this wrapper but is not routed into the app.

## 6) Backend Architecture
### App Bootstrap (`backend/server.js`)
- CORS enabled globally
- JSON and URL-encoded parsers enabled
- Ensures `uploads/` folder exists
- `multer` disk storage with `dest: 'uploads/'`
- Connects mongoose using `process.env.MONGO_URI`

### Data Model (`backend/models/Claim.js`)
Schema fields:
- `vehicleDetails`: vin, marketValue, age, model
- `incidentDetails`: date, description
- `aiReport`: total_cost, confidence (Mixed), damaged_parts (Array)
- `status`: default `Auto-Assessed`
- `hfFileUrl`
- timestamps enabled

### API Endpoints
`POST /api/segment-car`
- Form-data field: `image` (single file)
- Optional form fields: `vehicleDetails`, `incidentDetails` (JSON strings)
- Calls HF Space via `@gradio/client`
- Reads returned JSON report URL
- Persists claim
- Returns:
```json
{
  "success": true,
  "message": "Inference successful & Data Saved",
  "claimId": "<mongo-id>",
  "report": {"...": "hf-json"},
  "fileUrl": "<hf-json-url>"
}
```

`POST /api/explain`
- Body: `{ claimId, message }`
- Loads claim from DB
- Builds context prompt
- Calls Gemini model `gemini-2.5-flash-lite`
- Returns `{ answer: "..." }`

`GET /api/claims`
- Returns all claims sorted by newest first.

Note:
- `backend/routes/index.js` defines `/test` route, but it is not mounted in `server.js`.

## 7) Environment Variables and Config
Backend env expected by code:
- `PORT` (optional, default 5000)
- `MONGO_URI` (required by current code)
- `GEMINI_API_KEY` (required for `/api/explain`)

Frontend env:
- `VITE_API_URL` is supported by API wrapper but not used in main flow pages.

Important mismatch:
- Root `README.md` mentions `MONGODB_URI`, but backend code uses `MONGO_URI`.

## 8) Implemented vs Claimed/Planned AI Components
Implemented in this repo:
- External inference call to HF Space (opaque model internals)
- Persisted AI report storage
- Gemini-based textual explanation using DB context

Not implemented directly in this repo codebase (as first-class local modules):
- Local MobileNet gatekeeper model
- Local YOLO training/inference pipeline
- Explicit OpenCV preprocessing pipeline (CLAHE, blur rejection, etc.)
- Local XGBoost training/inference code
- SHAP/Grad-CAM generation pipeline
- Dataset validation/evaluation scripts

Interpretation:
- Many advanced AI details in the supplied 13-point documentation are currently conceptual/aspirational or delegated to the remote HF Space.

## 9) Data Contracts and Field Notes
Frontend `vehicleDetails` currently sends keys:
- `vin`, `year`, `make`, `model`, `car_model_val`, `car_age`

Backend schema expects vehicle keys:
- `vin`, `marketValue`, `age`, `model`

Impact:
- `year`, `make`, `car_model_val`, `car_age` may persist as extra fields (Mongoose strict behavior on nested object should be verified) or be dropped depending on schema strictness.
- Backend prompt references `claim.vehicleDetails?.year`, but schema does not define `year`.

AI report field mismatch examples:
- Schema has `damaged_parts`; frontend assessment reads `part_name` and `damage_type`.
- Confidence may be array/string/number; code partially handles this.

## 10) Known Issues / Risks
- Data-shape bug in dashboard report rendering (`setReportResult(data.report)` vs component expecting `{report, claimId}`).
- Inconsistent API base URL usage (hardcoded localhost in core pages vs env-based service helper).
- README/backend env variable mismatch (`MONGODB_URI` vs `MONGO_URI`).
- Unmounted test route (`/test`) and unmounted test component.
- Potential runtime compatibility risk: Node.js availability of global `Blob` depends on Node version.
- Temporary upload files deleted in happy/error paths, but synchronous FS operations may affect scalability under load.

## 11) UI/UX Notes
- UI is highly customized with framer-motion and Tailwind for a polished “CrashCost/InsureVision” experience.
- Landing and analytics pages are mostly presentation-driven with synthetic stats.
- Dashboard and XAI Lab provide the real integration points to backend.

## 12) How to Run (Current Practical Setup)
Backend:
1. `cd backend`
2. `npm install`
3. Create `.env` with:
   - `PORT=5000`
   - `MONGO_URI=<your mongodb connection string>`
   - `GEMINI_API_KEY=<your gemini key>`
4. `npm run dev`

Frontend:
1. `cd frontend`
2. `npm install`
3. (Optional) `.env` with `VITE_API_URL=http://localhost:5000/api`
4. `npm run dev`

## 13) Suggested Next Work Items (for another AI agent)
1. Fix dashboard report state contract:
   - Store full server response (`claimId + report`) or update `AssessmentReport` props accordingly.
2. Normalize API client usage:
   - Replace hardcoded fetch URLs with `services/api.js` and env config.
3. Align schema + frontend payload field names:
   - `marketValue/age` vs `car_model_val/car_age`, add `year/make` if needed.
4. Add mounted health/test endpoint and integration test.
5. Add robust validation and error payload contract across endpoints.
6. Update docs to reflect actual architecture vs aspirational roadmap.

## 14) File Inventory (non-dependency source files)
- `.gitignore`
- `README.md`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/server.js`
- `backend/models/Claim.js`
- `backend/routes/index.js`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/README.md`
- `frontend/index.html`
- `frontend/eslint.config.js`
- `frontend/postcss.config.js`
- `frontend/tailwind.config.js`
- `frontend/vite.config.js`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/index.css`
- `frontend/src/App.css`
- `frontend/src/controllers/useApi.js`
- `frontend/src/services/api.js`
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/components/TestApi.jsx`
- `frontend/src/components/TestApi.css`
- `frontend/src/pages/landingPage.jsx`
- `frontend/src/pages/dashboardPage.jsx`
- `frontend/src/pages/analyticsPage.jsx`
- `frontend/src/pages/xaiLabPage.jsx`
- `frontend/src/assets/` image files (UI assets)

---

This `project_context.md` is implementation-grounded: it describes what the code currently does, where the data flows, and where conceptual documentation exceeds current code reality.
