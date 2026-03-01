import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from './pages/landingPage';
import DashboardPage from './pages/dashboardPage';
import AnalyticsPage from './pages/analyticsPage';
import XaiLabPage from './pages/xaiLabPage';

// Shared Layout Component
// This helps us keep the sidebar consistent across all dashboard pages
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f3f5f7]">
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. PUBLIC LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. INTAKE DASHBOARD (The Wizard) */}
        <Route 
          path="/dashboard" 
          element={
            <DashboardPage />
          } 
        />

        {/* 3. CLAIMS HISTORY & ANALYTICS */}
        <Route 
          path="/analytics" 
          element={
            <AnalyticsPage />
          } 
        />

        {/* 4. GEMINI AI REASONING LAB */}
        <Route 
          path="/xai-lab" 
          element={
            <XaiLabPage />
          } 
        />

        {/* 404 Redirect - Optional */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;