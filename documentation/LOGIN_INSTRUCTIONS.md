# 🚀 Quick Login Setup (Student Project Mode)

## Test Credentials (Works Immediately)
- **Email:** `test@test.com`
- **Password:** `password`

## How to Start the Application

### 1. Start Backend Server
```powershell
cd backend
npm start
```
The server will run on **http://localhost:5000**

### 2. Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```
The frontend will run on **http://localhost:5173**

## Login Steps
1. Open **http://localhost:5173** in your browser
2. Click **Login** button on the landing page
3. Enter credentials:
   - Email: `test@test.com`
   - Password: `password`
4. You'll be redirected to the **Dashboard** ✅

## Registration
You can also register a new account with any email/password. If MongoDB is not connected, it will still work in test mode.

## Troubleshooting

### Backend won't start
- Make sure you're in the `backend` folder
- Run: `npm install` first if you haven't

### Frontend won't start
- Make sure you're in the `frontend` folder
- Run: `npm install` first if you haven't

### Login button doesn't work
- Check that **both** backend (port 5000) and frontend (port 5173) are running
- Check the browser console (F12) for errors
- Make sure you're using the test credentials exactly as shown

### "Invalid credentials" error
- Double-check email: `test@test.com` (no spaces)
- Double-check password: `password` (all lowercase)

## Notes for College Project
- ✅ No MongoDB setup required - works with test account
- ✅ No rate limiting on login
- ✅ Simple authentication for demo purposes
- ✅ All dashboard features accessible after login
