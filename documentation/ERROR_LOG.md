# Auth Implementation — Error Post-Mortem (March 7, 2026)

**Task:** Wire up JWT + bcrypt authentication (backend + frontend)  
**Expected Time:** ~10 minutes | **Actual Time:** ~1 hour  
**Root Cause:** 3 cascading configuration misses, compounded by repeated browser testing instead of systematic debugging

---

## Error #1: Missing `axios` in Frontend

| Detail | Info |
|--------|------|
| **Symptom** | Vite overlay: `Failed to resolve import "axios" from "src/context/AuthContext.jsx"` |
| **Root Cause** | `AuthContext.jsx` imports `axios`, but it was never installed in `/frontend` |
| **Why It Happened** | `npm install axios` was run but **failed silently** (exit code 1) due to a peer dependency conflict with the existing `recharts` package |
| **Fix** | `npm install axios --legacy-peer-deps` |
| **Time Wasted** | ~10 minutes |
| **Lesson** | Always check `npm install` exit codes. Use `--legacy-peer-deps` when working with mixed React 18/19 dependency trees. |

---

## Error #2: Missing `react-is` Peer Dependency

| Detail | Info |
|--------|------|
| **Symptom** | Vite/ESBuild crash: `Could not resolve "react-is"` from `recharts/es6/util/ReactUtils.js` |
| **Root Cause** | Installing `axios` triggered npm to recalculate the dependency tree, which exposed a previously unresolved `react-is` peer dependency required by `recharts` |
| **Why It Happened** | `react-is` was a transitive dependency that was silently missing before, only surfacing when npm reshuffled `node_modules` |
| **Fix** | `npm install react-is` |
| **Time Wasted** | ~10 minutes |
| **Lesson** | When Vite crashes after installing a new package, check if the new install broke peer dependencies of existing packages — not just the new one. |

---

## Error #3: `AuthProvider` Never Injected into `App.jsx` (THE BIG ONE)

| Detail | Info |
|--------|------|
| **Symptom** | Landing page renders as a **blank white screen**. Console says: `An error occurred in the <AuthModal> component` |
| **Root Cause** | `App.jsx` was never wrapped with `<AuthProvider>`, so `useAuth()` inside `AuthModal` returned `undefined`. Calling `.login()` or `.register()` on `undefined` crashed React's entire component tree |
| **Why It Happened** | The first `multi_replace_file_content` call to edit `App.jsx` **failed silently** because the file structure didn't match the expected content (App.jsx had `xaiLabPage` imports that weren't in the truncated conversation context). The agent didn't verify the edit was applied and moved on |
| **Fix** | One line: wrap `<Router>` inside `<AuthProvider>` in `App.jsx` |
| **Time Wasted** | ~30+ minutes |
| **Lesson** | **Always verify edits were actually applied** — especially when editing root-level files like `App.jsx`. A failed silent edit at the root can make every downstream component crash with misleading errors. |

---

## Error #4: Missing Vite Proxy Configuration

| Detail | Info |
|--------|------|
| **Symptom** | Auth Modal shows "Registration failed" error after clicking Create Account |
| **Root Cause** | Axios was POSTing to `http://localhost:5174/api/auth/register` (Vite's port) instead of `http://localhost:5000/api/auth/register` (Express backend). Vite returned a 404 |
| **Why It Happened** | `vite.config.js` had no `server.proxy` entry to forward `/api` requests to the backend |
| **Fix** | Added proxy config to `vite.config.js`: `/api` → `http://localhost:5000` |
| **Time Wasted** | ~5 minutes |
| **Lesson** | When frontend and backend run on different ports, you MUST configure the dev server proxy. This is a standard Vite setup step that should be done immediately when adding any backend API calls. |

---

## Why It Took So Long (The Spiral)

```
Error #1 (axios missing) → Vite crashes
  ↓ fix axios
Error #2 (react-is missing) → Vite crashes again
  ↓ fix react-is
Error #3 (AuthProvider missing) → White screen, misleading error
  ↓ agent assumes AuthModal JSX is broken
  ↓ spends 30 min editing AuthModal tags instead of checking App.jsx
  ↓ runs 5+ browser tests, each taking 2-3 min, all failing
  ↓ finally checks App.jsx → finds AuthProvider was never added
  ↓ one-line fix
Error #4 (no proxy) → 404 on API call
  ↓ quick fix in vite.config.js
```

**Key Takeaway:** The agent kept running expensive browser tests (2-3 min each) hoping each fix worked, instead of stepping back and systematically checking: Dependencies installed? → Provider wrapped? → Proxy configured? → Server running? A checklist-based approach would have caught all 4 issues in under 5 minutes.

---

## Files Modified During Auth Implementation

| File | Change |
|------|--------|
| `backend/models/User.js` | New — Mongoose user schema |
| `backend/controllers/authController.js` | New — Register + Login logic |
| `backend/routes/authRoutes.js` | New — POST routes |
| `backend/middleware/authMiddleware.js` | New — JWT verification middleware |
| `backend/server.js` | Modified — Mounted auth routes |
| `frontend/src/context/AuthContext.jsx` | New — Global auth state |
| `frontend/src/components/AuthModal.jsx` | Modified — Real form submission + error display |
| `frontend/src/App.jsx` | Modified — Wrapped with AuthProvider |
| `frontend/vite.config.js` | Modified — Added /api proxy |
