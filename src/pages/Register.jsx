import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import SEO from "../components/SEO";
import api from "../api";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationHints, setValidationHints] = useState({
    email: "",
    username: "",
    password: ""
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "";
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateUsername = (username) => {
    if (!username) return "";
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.length > 20) {
      return "Username must be less than 20 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, hyphens, and underscores";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "";
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // Real-time validation
    if (field === "email") {
      setValidationHints({ ...validationHints, email: validateEmail(value) });
    } else if (field === "username") {
      setValidationHints({ ...validationHints, username: validateUsername(value) });
    } else if (field === "password") {
      setValidationHints({ ...validationHints, password: validatePassword(value) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setValidationHints({ email: "", username: "", password: "" });

    // Validate all fields
    const emailError = validateEmail(form.email);
    const usernameError = validateUsername(form.username);
    const passwordError = validatePassword(form.password);

    if (emailError || usernameError || passwordError) {
      setError(emailError || usernameError || passwordError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("auth/register/", {
        email: form.email,
        username: form.username,
        password: form.password
      });

      // Only set success if we get a successful response
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setError(""); // Clear any errors
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      setSuccess(false); // Ensure success is false on error

      // Handle field-specific errors from backend
      const errorData = err.response?.data;

      if (errorData?.errors) {
        // Backend returned field-specific errors
        const errors = errorData.errors;

        // Set validation hints for each field
        setValidationHints({
          email: errors.email || "",
          username: errors.username || "",
          password: errors.password || ""
        });

        // Set general error message
        setError(errorData.message || "Please fix the errors below");
      } else if (errorData?.error) {
        // Single error message
        setError(errorData.error);
      } else {
        // Fallback error
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (cred) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await api.post("auth/google-login/", {
        token: cred.credential,
      });

      if (res.data.access && res.data.refresh) {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        window.location.href = "/explore";
      } else {
        setError("Google registration failed - invalid response");
      }
    } catch (error) {
      console.error("Google registration error:", error);
      setError("Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Register" description="Create your CommandVault account to start storing and sharing AI prompts" />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>CommandVault</h1>
            <p>Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!success && error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                <strong>Account created successfully!</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  Please check your email to verify your account before logging in.
                </p>
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={success}
              />
              {validationHints.email && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {validationHints.email}
                </div>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                disabled={success}
              />
              {validationHints.username && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {validationHints.username}
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                disabled={success}
              />
              {validationHints.password && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {validationHints.password}
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                disabled={success}
              />
            </div>

            <button type="submit" disabled={loading || success}>
              {loading ? "Creating account..." : success ? "Account Created!" : "Register"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError("Google registration failed")}
            />
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </>
  );
}
