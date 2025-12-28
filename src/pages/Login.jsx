import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import SEO from "../components/SEO";
import api from "../api";
import "./Auth.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setLoading(true);

    try {
      const res = await api.post("auth/login/", { email, password });

      if (res.data.access && res.data.refresh) {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        navigate("/explore");
      }
    } catch (err) {
      // Handle specific error messages from backend
      const errorData = err.response?.data;

      if (errorData?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true);
        setError(errorData.error);
      } else if (errorData?.error) {
        setError(errorData.error);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setError("");

    try {
      await api.post("auth/resend-verification/");
      setError("");
      alert("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGoogle = async (cred) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("auth/google-login/", {
        token: cred.credential,
      });

      if (res.data.access && res.data.refresh) {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        window.location.href = "/explore";
      } else {
        setError("Google login failed - invalid response");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login" description="Login to CommandVault to manage your AI prompts" />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>CommandVault</h1>
            <p>Welcome back! Login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
                {emailNotVerified && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      style={{
                        padding: '8px 16px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: resendingEmail ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError("Google login failed")}
            />
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </>
  );
}
