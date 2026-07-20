import { useState } from "react";
import toast from "react-hot-toast";
import { createUser } from "../service/Api";
import "./Register.css";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            className="input-field"
            onChange={(e) => setPassword(e.target.value)}
          />
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
