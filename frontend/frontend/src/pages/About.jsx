import { Link } from "react-router-dom";
import "../App.css";
import hero from "../assets/hero.png";
const About = () => {
  return (
    <div>
      <Link to="/" className="back-link">← Back to home</Link>
      <div>About</div>
      <img src="../favicon.svg" />
      <img src={hero} />
    </div>
  );
};

export default About;
