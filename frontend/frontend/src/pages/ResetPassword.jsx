import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../service/Api";
import "./ForgotPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, { password });
      toast.success(response.data.message || "Password reset successfully");
      navigate("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Reset link is invalid or has expired");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-container">
      <h2 className="welcome-title">Reset Password</h2>
      <p className="welcome-sub">Choose a new password for your account</p>

      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <Link to="/login" className="back-link">Back to login</Link>
    </div>
  );
};

export default ResetPassword;
