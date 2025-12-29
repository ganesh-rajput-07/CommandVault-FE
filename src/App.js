import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { PromptProvider } from './context/PromptContext';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyPrompts from "./pages/MyPrompts";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PromptDetail from "./pages/PromptDetail";
import UserProfile from "./pages/UserProfile";
import Trending from "./pages/Trending";
import SavedPrompts from "./pages/SavedPrompts";
import CreatePrompt from "./pages/CreatePrompt";
import VerifyEmail from "./pages/VerifyEmail";
import QRScanner from "./pages/QRScanner";

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
      <PromptProvider>
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
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Main Dashboard Routes */}
            <Route path="/explore" element={
              <ProtectedRoute>
                <Dashboard type="explore" />
              </ProtectedRoute>
            } />
            <Route path="/trending" element={
              <ProtectedRoute>
                <Trending />
              </ProtectedRoute>
            } />
            <Route path="/prompt/:slug" element={
              <ProtectedRoute>
                <PromptDetail />
              </ProtectedRoute>
            } />
            <Route path="/user/:username" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/my-prompts" element={
              <ProtectedRoute>
                <MyPrompts />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedPrompts />
              </ProtectedRoute>
            } />
            <Route path="/create-prompt" element={
              <ProtectedRoute>
                <CreatePrompt />
              </ProtectedRoute>
            } />
            <Route path="/scan" element={
              <ProtectedRoute>
                <QRScanner />
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
      </PromptProvider>
    </HelmetProvider>
  );
}
