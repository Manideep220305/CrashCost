Backend Documentation – InsureVision3
=====================================

Audience: **3rd year B.Tech CSE student**, intermediate MERN developer.

Goal: After reading this file, you should understand **exactly how the backend works** – which file handles what, how requests flow through Express, how MongoDB is used, and how the AI (Hugging Face + Gemini) is integrated.

---

1) Big Picture – What the Backend Does
--------------------------------------

The backend is a **Node.js + Express + MongoDB** API server. It provides:

- **Authentication**:
  - Register and login endpoints.
  - Returns **JWT tokens** that the frontend stores and sends back.
- **Claim handling**:
  - Accepts an uploaded **damage photo** plus form data.
  - Calls an external **CrashCost AI engine** (FastAPI on Hugging Face).
  - Saves the AI report and user’s form data as a `Claim` in MongoDB.
- **Explainable AI (XAI)**:
  - Loads a saved claim.
  - Sends its details + the user’s question to **Gemini**.
  - Returns a natural-language explanation.
- **Analytics support**:
  - APIs for getting all claims (or claims by user) and a claim by ID.

You can think of it as the **brain + database** that your React frontend talks to.

---

2) Folder Structure (Backend)
-----------------------------

Inside `backend/`:

- `server.js` – **Main entry point**. Creates Express app, connects MongoDB, mounts routes, sets rate limits, etc.
- `models/`
  - `User.js` – Mongoose schema for users.
  - `Claim.js` – Mongoose schema for claims.
- `controllers/`
  - `authController.js` – Logic for register + login + JWT.
  - `claimController.js` – Logic for analyzing claims, explaining claims, and fetching claims.
- `routes/`
  - `authRoutes.js` – `/api/auth/...` routes.
  - `claimRoutes.js` – `/api/segment-car`, `/api/explain`, `/api/claims`, `/api/claims/:id`.
  - `index.js` – Simple `/test` route (not currently mounted).
- `middleware/`
  - `authMiddleware.js` – Verifies JWT and attaches `req.user`.
- `config/`
  - `gemini.js` – Configures Gemini API with multi-key rotation.
- Scripts and dev helpers:
  - `verifyKeys.js` – Test Gemini API keys.
  - `submit_test_claims.js` – Logs in and posts multiple sample claims.
- `package.json`, `package-lock.json` – Dependencies and scripts.

---

3) How the Server Starts – `server.js`
--------------------------------------

File: `backend/server.js`

High-level steps:

1. **Load environment variables** using `dotenv`.
2. **Create Express app**.
3. Configure **CORS**, JSON parsing, and URL-encoded parsing.
4. Configure **file uploads** (Multer) and ensure the `uploads/` directory exists.
5. Configure **rate limiting** for sensitive AI endpoints.
6. Connect to **MongoDB** using `MONGO_URI`.
7. Mount **routes**:
   - `/api` → claim-related routes (`claimRoutes`).
   - `/api/auth` → auth-related routes (`authRoutes`).
8. Add a **health check route**: `GET /healthz`.
9. Start listening on `PORT` (default 5000).

Mentally, you can imagine:

> “When the backend starts, it sets up Express, prepares uploads, connects to MongoDB, then waits for HTTP requests and sends them to the appropriate controllers.”

---

4) Data Models – MongoDB Schemas
--------------------------------

### 4.1 User model – `models/User.js`

Represents a user that can log into the app.

Fields (simplified):
- `name` – string, required.
- `email` – string, required, unique.
- `password` – string, required, stored as **bcrypt hash**.
- Timestamps: `createdAt`, `updatedAt`.

Use:
- When the user registers:
  - A new `User` document is created with hashed password.
- When the user logs in:
  - The backend finds this `User` and checks the password using bcrypt.

### 4.2 Claim model – `models/Claim.js`

Represents a **single damage claim** + AI report.

Key parts:

- `userId`:
  - Type: `ObjectId` reference to `User`.
  - Optional (old claims might not have a user).
  - Tells you **which user** submitted the claim.

- `vehicleDetails`:
  - `vin` – 17-digit vehicle ID (optional).
  - `model` – e.g. `"Swift"`, `"i20"`.
  - `year` – e.g. `"2020"`.
  - `make` – manufacturer, e.g. `"Maruti"`, `"Hyundai"`.
  - `brand` – same idea as `make` (used by HF API).
  - `tier` – `"budget" | "mid" | "premium" | "luxury"`.
  - `segment` – `"hatchback" | "sedan" | "suv" | "compact_suv"`.
  - `damageLocation` – `"front" | "side" | "rear" | "top"`.
  - `car_model_val` – estimated market value in ₹.
  - `car_age` – age of vehicle in years.

- `incidentDetails`:
  - `date` – date of incident.
  - `description` – text description of what happened.

- `aiReport` (directly mirrors CrashCost FastAPI response):
  - `total_estimate` – sum of all detection prices (total cost).
  - `estimate_range` – `[min, max]` cost estimate range.
  - `context`:
    - `brand`, `tier`, `segment`, `location`.
  - `detections` – array of:
    - `id` – simple index (1, 2, 3, …).
    - `label` – e.g. `"FRONT_BUMPER_DENT"`.
    - `confidence` – number from 0.0–1.0.
    - `surface_detected` – e.g. `"metal"`, `"glass"`.
    - `severity` – `"MINOR"`, `"MODERATE"`, `"SEVERE"`.
    - `ratio` – how big the damage area is relative to the image.
    - `bbox` – bounding box (x1, y1, x2, y2) as a mixed object.
    - `price` – estimated cost for that damage.
    - `drivers` – array of SHAP-style feature names.
    - `summary` – 1–2 sentence summary.
    - `narrative` – longer paragraph.

- `status`:
  - String.
  - Default: `"Auto-Assessed"`.

- Options:
  - `{ timestamps: true }` so you automatically get `createdAt` and `updatedAt`.

This model is what powers:
- The **dashboard AI report view** (it uses `aiReport`).
- The **analytics page** (charts and stats from `aiReport`).
- The **XAI lab** (Gemini uses this data in the prompt).

---

5) Authentication – Register, Login, and JWT
--------------------------------------------

### 5.1 Controller – `controllers/authController.js`

Core responsibilities:
- **Generate JWT** for a user.
- **Register** new users.
- **Login** existing users.

#### generateToken(id)

Uses `jsonwebtoken` to:
- Sign a token with:
  - Payload: `{ id }`.
  - Secret: `process.env.JWT_SECRET || 'your-default-jwt-secret'`.
  - Expiration: 30 days.

#### registerUser(req, res)

Flow:
1. Read `{ name, email, password }` from `req.body`.
2. Validate all fields are present.
3. Check if a user with this email already exists.
4. Hash the password with `bcryptjs`.
5. Create a new user in MongoDB.
6. Generate a JWT token for the new user.
7. Return:
   ```json
   {
     "_id": "<user-id>",
     "name": "User Name",
     "email": "user@example.com",
     "token": "<jwt-token>"
   }
   ```

In case Mongo is temporarily unavailable (for student/dev scenarios), the code is written to still provide a smooth experience by returning a mock user. This lets the frontend be tested easily, but in a real production app you would remove such fallbacks.

#### loginUser(req, res)

Flow:

1. Read `{ email, password }` from `req.body`.
2. Special dev/test case:
   - If `email === 'test@test.com'` and `password === 'password'`:
     - Return a hardcoded test user with a valid JWT.
     - This does **not** require a real DB user.
3. Otherwise:
   - Find user by email in MongoDB.
   - If not found, return 401.
   - Compare supplied password with stored hash via `bcrypt.compare`.
   - If wrong, return 401.
   - If correct:
     - Generate JWT token using `generateToken`.
     - Return `user` data with `token`, similar to register.

### 5.2 Routes – `routes/authRoutes.js`

Defines:

- `POST /api/auth/register` → `registerUser`.
- `POST /api/auth/login` → `loginUser`.

This file is mounted in `server.js` as:

```js
app.use('/api/auth', authRoutes);
```

So the full paths are:
- `POST /api/auth/register`
- `POST /api/auth/login`

### 5.3 Auth Middleware – `middleware/authMiddleware.js`

This is what protects routes like `/api/segment-car`.

Flow:
1. Check `req.headers.authorization`.
2. Expect format: `"Bearer <token>"`.
3. Extract the token part.
4. Use `jwt.verify(token, JWT_SECRET)`:
   - If invalid or expired → return 401.
5. Use decoded payload `id` to find the user in MongoDB:
   - `User.findById(decoded.id).select('-password')`.
6. Attach the user to `req.user`.
7. Call `next()` to move to the controller.

If the header is missing or invalid:
- Responds with 401 and an error message.

**Important mental model**:
> Any controller that needs to know “who is this user?” relies on `authMiddleware` to set `req.user`.

---

6) Claim Analysis – Image → Hugging Face → MongoDB
--------------------------------------------------

### 6.1 Route definition – `routes/claimRoutes.js`

Main endpoints:

- `POST /api/segment-car`
  - Middlewares:
    - `protect` (authMiddleware).
    - `upload.single('image')` from Multer.
  - Controller:
    - `analyzeClaim`.

- `POST /api/explain`
  - Controller: `explainClaim`.

- `GET /api/claims`
  - Controller: `getAllClaims`.

- `GET /api/claims/:id`
  - Controller: `getClaimById`.

### 6.2 Multer – File upload handling

In `server.js`, Multer is configured to:
- Use disk storage with destination `uploads/`.
- Store each uploaded file temporarily.

When a request hits `POST /api/segment-car`:
- `upload.single('image')`:
  - Parses the `multipart/form-data`.
  - Writes the file to `uploads/<random-filename>`.
  - Attaches the file info to `req.file`.

After that, the controller `analyzeClaim` runs.

### 6.3 Controller – `controllers/claimController.js`

#### `analyzeClaim(req, res)`

High-level purpose:
- Orchestrates the **full pipeline**:
  - Receive form + image from frontend.
  - Send image + metadata to CrashCost FastAPI (Hugging Face).
  - Get AI report.
  - Save claim to MongoDB with `userId`.
  - Send AI report back to frontend.

Step-by-step:

1. **Validation**:
   - If `!req.file`, return `400` with `"No image uploaded"`.
2. **Parse form data**:
   - `vehicleDetails = JSON.parse(req.body.vehicleDetails || "{}")`.
   - `incidentDetails = JSON.parse(req.body.incidentDetails || "{}")`.
3. **Prepare HF FastAPI request**:
   - Read the uploaded file:
     - `const imageBuffer = fs.readFileSync(req.file.path);`
   - Create a new `FormData` object.
   - Append:
     - `image` with `imageBuffer`, `filename`, `contentType`.
     - `brand`, `tier`, `segment`, `location`, `age` mapped from `vehicleDetails`:
       - `brand`: `vehicleDetails.brand || vehicleDetails.make || 'unknown'`.
       - `tier`: `vehicleDetails.tier || 'mid'`.
       - `segment`: `vehicleDetails.segment || 'sedan'`.
       - `location`: `vehicleDetails.damageLocation || 'front'`.
       - `age`: `String(vehicleDetails.car_age || 5)`.
4. **Call Hugging Face FastAPI**:
   - `axios.post(HF_API_URL, form, { headers: form.getHeaders(), timeout: 120000, ... })`.
   - `HF_API_URL` points to your deployed CrashCost engine.
   - Receives `aiReport` as JSON.
5. **Clean up temp file**:
   - If the file exists on disk, delete it (`fs.unlinkSync`).
6. **Create and save Claim document**:
   - `userId`: comes from `req.user?.id` (decoded from JWT by `authMiddleware`).
   - `vehicleDetails`: copy of parsed form, with some normalization (ensuring `brand`, `damageLocation`).
   - `incidentDetails`: from parsed JSON.
   - `aiReport`: picked from the HF response.
   - Call `newClaim.save()` to store in MongoDB.
7. **Return response**:
   - If everything works:
     ```json
     {
       "success": true,
       "message": "AI analysis complete",
       "claimId": "<mongo-claim-id>",
       "report": { ...full AI report from HF... }
     }
     ```
8. **Error handling**:
   - If HF request times out:
     - Return 504 with helpful message about warm-up.
   - On any other error:
     - Delete temp file if it exists.
     - Return 500 with `error: "Analysis failed"` and `details`.

Mental model:
> `analyzeClaim` is the “heavy” endpoint that talks to another AI service, saves to DB, and returns detailed structured AI results.

---

7) Explainable AI – Gemini Integration
--------------------------------------

### 7.1 Gemini config – `config/gemini.js`

Purpose:
- Configure Gemini models and rotate between multiple API keys to avoid hitting free-tier limits.

Key ideas:
- Collect API keys from:
  - `GEMINI_API_KEY`
  - `GEMINI_API_KEY_1`
  - `GEMINI_API_KEY_2`
- Filter out any empty strings.
- If **no** keys are found:
  - Log a critical error.
  - `process.exit(1)` so you don’t deploy a broken app.
- Use a simple index + modulo (`%`) to cycle through keys.
- Export `getNextGeminiModel()`:
  - Each call returns a Gemini model instance (e.g. `gemini-2.5-flash`) using the next key.

### 7.2 Controller – `explainClaim(req, res)`

Purpose:
- Provide **natural language explanations** for a claim using Gemini.

Flow:

1. Read `{ claimId, message }` from `req.body`.
2. Load the claim from MongoDB:
   - `const claim = await Claim.findById(claimId);`
   - If not found: return 404.
3. Get a Gemini model client:
   - `const model = getNextGeminiModel();`
4. Build a **prompt string** that includes:
   - Vehicle info (year, make/brand, model).
   - Tier, segment, damage location, vehicle age.
   - Incident description.
   - Total estimate and range.
   - A bullet list of detections (label, severity, price, summary).
   - The user’s question.
5. Send to Gemini:
   - `const result = await model.generateContent(prompt);`
   - `const text = await result.response.text();`
6. Return JSON:
   - `{ answer: text }`.
7. On error:
   - Log the error and return status 500 with the error message.

Mental model:
> `explainClaim` converts structured data from MongoDB into an English explanation using Gemini.

---

8) Claims API for History and Analytics
---------------------------------------

### 8.1 `getAllClaims(req, res)`

Purpose:
- Return a list of claims for the analytics page and XAI lab.

Flow:
- Read optional `userId` from `req.query`.
- Build a query:
  - If `userId` present: `{ userId }`.
  - Else: `{}` (all claims).
- Fetch:
  - `Claim.find(query).sort({ createdAt: -1 })`.
- Return the array of claims as JSON.

Used by:
- `AnalyticsPage` (`GET /api/claims?userId=<id>`).
- `XaiLabPage` (`GET /api/claims?userId=<id>`).

### 8.2 `getClaimById(req, res)`

Purpose:
- Fetch a **specific** claim, useful if you want a detail view later.

Flow:
- Read `id` from `req.params`.
- `Claim.findById(id)`.
- If not found:
  - 404 with `"Claim not found."`.
- Else:
  - Return full claim document as JSON.

---

9) Environment Variables and Configuration
------------------------------------------

### 9.1 Required / important env vars

In `backend/.env` (or your deployment environment), you should set:

- `PORT` – port to run Express on (e.g. `5000`).
- `MONGO_URI` – MongoDB connection string (Atlas or local).
- `JWT_SECRET` – secret string for signing JWTs.
- `GEMINI_API_KEY`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2` – one or more Gemini keys.

Note:
- Older docs might mention `MONGODB_URI`. The actual code uses `MONGO_URI`.

### 9.2 Development vs Production behavior

Development:
- Run `npm run dev` (likely using `nodemon`) from `backend/`.
- Connects to `MONGO_URI`.
- Accepts `/api/*` calls from the Vite frontend (which runs on port 5173).

Production (example: Render):
- Use `npm start` as start command.
- `PORT` is injected by the host.
- `GET /healthz` is used for health checks.
- `express-rate-limit` and `app.set('trust proxy', 1)` are important to correctly limit per real client IP.

---

10) Scripts and Developer Tools
-------------------------------

### 10.1 `verifyKeys.js`

Purpose:
- Quickly verify that each configured Gemini API key is valid.

What it does:
- For each of `GEMINI_API_KEY`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`:
  - Tries a simple `generateContent("test")`.
  - Logs success or failure.

Use when:
- You are setting up a new environment and want to confirm keys work before hitting the `/api/explain` endpoint.

### 10.2 `submit_test_claims.js`

Purpose:
- Seed the backend with multiple test claims using local images.

High-level:
- Logs in using hardcoded credentials (e.g. `manideep@test.com` / `test123`).
- For each image/metadata pair in a list:
  - Builds a `FormData` similar to the dashboard.
  - Sends `POST /api/segment-car` with token.
- Useful to generate realistic history quickly.

Note:
- Paths inside this script are specific to the author’s Windows machine; you’d need to adjust them to run it on your own system.
- Written with ES module syntax – you may need to adjust Node config to run directly.

---

11) Security and Improvements – What to Watch Out For
-----------------------------------------------------

### 11.1 Current security model

- `/api/segment-car`:
  - **Protected** by JWT via `authMiddleware`.
  - Only logged-in users can submit new claims.

- `/api/claims`, `/api/claims/:id`, `/api/explain`:
  - **Not currently protected**.
  - In a production system, you would usually require JWT for:
    - All these routes.
    - And filter `/api/claims` by the logged-in user **on the server side**, not just via `userId` query param.

### 11.2 Data ownership

- Because some earlier claims may not have `userId` set, the backend allows:
  - `getAllClaims` with no `userId` filter to get all claims.
  - This is convenient for debugging but not ideal for real multi-user production.

### 11.3 Resilience and error handling

- `analyzeClaim`:
  - Cleans up temporary files in both success and error cases.
  - Handles HF timeouts explicitly (504).
- However, you could further:
  - Add schema validation (e.g. with Joi or Zod).
  - Standardize error response shapes (e.g. `{ errorCode, message }`).

---

12) Mental Model of Request Flow
--------------------------------

To summarize, imagine this sequence for the main paths:

### 12.1 Claim submission

1. Frontend sends:
   - `Authorization: Bearer <JWT>`.
   - `FormData` with `image`, `vehicleDetails`, `incidentDetails`.
2. `authMiddleware` verifies JWT → sets `req.user`.
3. Multer reads `image` → `req.file`.
4. `analyzeClaim`:
   - Reads file.
   - Sends to HF FastAPI.
   - Gets `aiReport`.
   - Saves a `Claim` in MongoDB with `userId`.
   - Returns `claimId` + `report`.

### 12.2 Analytics + XAI

1. Frontend calls:
   - `GET /api/claims?userId=<user-id>` to load history.
   - `POST /api/explain` with `{ claimId, message }` to get explanations.
2. `getAllClaims` loads data from `Claim` collection.
3. `explainClaim` loads one claim, builds Gemini prompt, returns natural language response.

If you can explain this flow out loud to someone, you’ve basically mastered the backend of this project.

---

13) How to Extend the Backend as a Student
------------------------------------------

Some ideas for practice:

- **Add a new secure route**:
  - Example: `GET /api/me` – returns current user’s profile.
  - Use `authMiddleware` and `req.user`.

- **Add claim status updates**:
  - Add fields like `manualStatus`, `reviewedBy`, etc. to `Claim` schema.
  - Implement `PATCH /api/claims/:id/status`.

- **Add admin-only endpoints**:
  - Add a field `role` to `User` (`'user' | 'admin'`).
  - Create `adminMiddleware` that checks `req.user.role`.
  - Create routes like `GET /api/admin/claims` for all claims.

- **Improve validation**:
  - Use a library to validate incoming body data (e.g. `vehicleDetails` fields).

As you do these, always keep this mental model:

> **Routes** define the URL + HTTP method → **Middleware** adds cross-cutting behavior (auth, uploads, rate limiting) → **Controllers** implement the actual logic using **Models** and external services (HF, Gemini).

