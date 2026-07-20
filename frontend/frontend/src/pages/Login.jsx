import { useState } from "react";
import toast from "react-hot-toast";
import { loginUser } from "../service/Api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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
