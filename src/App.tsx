/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AboutPage from './pages/AboutPage';
import { UserRole } from './types';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return null; // Or skeleton
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && profile?.role !== UserRole.ADMIN) return <Navigate to="/" />;
  
  return <>{children}</>;
}

function PageRoutes() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<RegistrationPage />} />
            <Route path="/events/:id?" element={<EventDetailsPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <PageRoutes />
      </Router>
    </AuthProvider>
  );
}
