import { useState } from "react";
import toast from "react-hot-toast";
import { createUser } from "../service/Api";
import "./Register.css";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault(); // prevent page reload

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (image) formData.append("image", image);

      const response = await createUser(formData);
      toast.success(response.data.message || "Account created successfully");
      navigate("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="Register-Wrapper">
      <main className="register-container">
        <h2 className="welcome-title">Welcome to RoamNepal</h2>
        <p className="welcome-sub">Create your account to begin...</p>

        <form onSubmit={register}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            className="input-field"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            className="input-field"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              className="input-field"
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
          <label className="file-label">
            <input
              type="file"
              className="input-field"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </main>
    </div>
  );
};

export default Register;
