import { useState } from "react";
import toast from "react-hot-toast";
import { loginUser } from "../service/Api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const login = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const data = { email, password, remember };
      const response = await loginUser(data);

      const { token, user } = response.data;
      setAuth(token, user);

      toast.success(response.data.message || "Login successfully");

      if (user.role === "admin") {
        navigate("/user");
      } else {
        navigate("/home");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to login");
    }
  };

  return (
    <div className="Login-Wrapper">
      <div className="login-container">
        <h2 className="welcome-title">Welcome</h2>
        <p className="welcome-sub">Have a great journey ahead...</p>

        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-4.22 5.22M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="btn">SIGN IN</button>
        </form>

        <div className="signup">
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </div>

        <Link to="/forgot-password" className="forgot">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
