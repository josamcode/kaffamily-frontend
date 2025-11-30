import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import Contact from './pages/Contact';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminSettings from './pages/Admin/Settings';
import AdminUsers from './pages/Admin/Users';
import AdminCollections from './pages/Admin/Collections';
import AdminAnnouncements from './pages/Admin/Announcements';
import AdminStaff from './pages/Admin/Staff';
import AdminGames from './pages/Admin/Games';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminQuickActions from './pages/Admin/QuickActions';
import Profile from './pages/Profile';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Collections />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Games />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GameDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Contact />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminCollections />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminAnnouncements />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminStaff />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/games"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminGames />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quick-actions"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminQuickActions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
