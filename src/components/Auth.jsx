import { useState } from "react";
import API_BASE_URL from "../config";

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const endpoint = isLogin ? "/api/login" : "/api/register";

    const requestData = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : formData;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setMessage(data.message);
      onAuthSuccess(data.user);
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-logo">✓</div>
        <h1>TaskFlow</h1>
        <p>Organize your work. Achieve more.</p>

        <div className="brand-features">
          <div>
            <span>✓</span>
            <p>Manage all your tasks in one place</p>
          </div>
          <div>
            <span>✓</span>
            <p>Track progress and stay productive</p>
          </div>
          <div>
            <span>✓</span>
            <p>Focus on what matters most</p>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h2>{isLogin ? "Welcome back!" : "Create your account"}</h2>

          <p className="auth-subtitle">
            {isLogin
              ? "Log in to continue managing your tasks."
              : "Start organizing your work with TaskFlow."}
          </p>

          {error && <div className="message error-message">{error}</div>}
          {message && <div className="message success-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <button
              className="primary-button full-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </button>
          </form>

          <p className="switch-auth">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button type="button" onClick={switchMode}>
              {isLogin ? " Create one" : " Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;