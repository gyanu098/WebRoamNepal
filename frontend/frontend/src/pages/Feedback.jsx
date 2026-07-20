import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { submitFeedback } from "../service/Api";
import { useAuth } from "../context/AuthContext";
import "./ForgotPassword.css";

const Feedback = () => {
  const { isAuthenticated, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write your feedback before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({ name, email, message });
      toast.success("Thanks for your feedback!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-container">
      <h2 className="welcome-title">Share Feedback</h2>
      <p className="welcome-sub">
        {isAuthenticated
          ? `Sending as ${user?.name || "you"}`
          : "Tell us what's working, what's not, or what you'd like to see."}
      </p>

      <form onSubmit={handleSubmit}>
        {!isAuthenticated && (
          <>
            <input
              type="text"
              placeholder="Your name (optional)"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}
        <textarea
          className="input-field"
          rows="5"
          placeholder="Your feedback or issue report..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Feedback"}
        </button>
      </form>

      <Link to="/" className="back-link">← Back to home</Link>
    </div>
  );
};

export default Feedback;
