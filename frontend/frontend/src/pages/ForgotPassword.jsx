import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { forgotPassword } from "../service/Api";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email });
      toast.success(response.data.message || "Reset link sent to your email");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error sending reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-container">
      <h2 className="welcome-title">Forgot Password?</h2>
      <p className="welcome-sub">Enter your email to reset</p>

      <form onSubmit={handleForgot}>
        <input
          type="email"
          placeholder="Enter your email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <Link to="/login" className="back-link">Back to login</Link>
    </div>
  );
};

export default ForgotPassword;
