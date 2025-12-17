import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditPromptPage } from './pages/EditPromptPage';
import { PromptDetailPage } from './pages/PromptDetailPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-slate-500">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-background text-slate-200 font-sans">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/prompt/:id" element={<PromptDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/prompts/new" element={
              <ProtectedRoute><EditPromptPage /></ProtectedRoute>
            } />
            <Route path="/prompts/:id/edit" element={
              <ProtectedRoute><EditPromptPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;