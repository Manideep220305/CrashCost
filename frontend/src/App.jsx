import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage from './pages/landingPage';
import DashboardPage from './pages/dashboardPage';
import AnalyticsPage from './pages/analyticsPage';
import XaiLabPage from './pages/xaiLabPage';
import InsuranceGuidePage from './pages/insuranceGuidePage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/xai-lab" element={<XaiLabPage />} />
            <Route path="/insurance-101" element={<InsuranceGuidePage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;