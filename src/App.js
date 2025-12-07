import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyPrompts from "./pages/MyPrompts";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('access');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('access');

  if (token) {
    return <Navigate to="/explore" replace />;
  }

  return children;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Main Dashboard Routes */}
          <Route path="/explore" element={
            <ProtectedRoute>
              <Dashboard type="explore" />
            </ProtectedRoute>
          } />
          <Route path="/trending" element={
            <ProtectedRoute>
              <Dashboard type="trending" />
            </ProtectedRoute>
          } />
          <Route path="/my-prompts" element={
            <ProtectedRoute>
              <MyPrompts />
            </ProtectedRoute>
          } />

          {/* Legacy route redirect */}
          <Route path="/dashboard" element={<Navigate to="/explore" replace />} />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
