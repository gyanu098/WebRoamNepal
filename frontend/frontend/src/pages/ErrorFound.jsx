import { Link } from "react-router-dom";
import "./ErrorFound.css";

const ErrorFound = () => {
  return (
    <div className="error-found">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/" className="back-link">← Back to home</Link>
    </div>
  );
};

export default ErrorFound;
