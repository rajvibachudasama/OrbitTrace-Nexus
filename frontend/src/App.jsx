import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConstellationProvider } from './context/ConstellationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { DashboardSOC } from './pages/DashboardSOC';
import { ConstellationView } from './pages/ConstellationView';
import { TrustAnalytics } from './pages/TrustAnalytics';
import { AttackLab } from './pages/AttackLab';
import { ResponseIsolation } from './pages/ResponseIsolation';
import { MissionControl } from './pages/MissionControl';
import { SecurityAudit } from './pages/SecurityAudit';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ConstellationProvider>
      <div className="min-h-screen flex flex-col bg-space-bg space-grid-bg text-slate-100 selection:bg-cyber-cyan selection:text-black">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardSOC />} />
              <Route path="/constellation" element={<ConstellationView />} />
              <Route path="/trust" element={<TrustAnalytics />} />
              <Route path="/attack-lab" element={<AttackLab />} />
              <Route path="/response" element={<ResponseIsolation />} />
              <Route path="/mission-control" element={<MissionControl />} />
              <Route path="/audit" element={<SecurityAudit />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ConstellationProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
