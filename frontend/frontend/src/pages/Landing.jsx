import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllPlaces, getImageUrl } from "../service/Api";
import "./Landing.css";

const FEATURES = [
  {
    icon: "🗺️",
    title: "Discover hidden gems",
    text: "Browse spots shared by real travelers, from remote viewpoints to quiet teahouses off the usual trail.",
  },
  {
    icon: "📸",
    title: "Share your own finds",
    text: "Post a photo, a location, and a story so the next traveler knows where to look.",
  },
  {
    icon: "⭐",
    title: "Read honest reviews",
    text: "Rate and review places you've visited to help others plan with confidence.",
  },
  {
    icon: "💬",
    title: "Connect with travelers",
    text: "Save favorites and message people who've been where you're headed next.",
  },
];

const Landing = () => {
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async () => {
      try {
        const response = await getAllPlaces();
        if (!cancelled) {
          setPreview((response.data.places || []).slice(0, 4));
        }
      } catch {
        // Preview strip is a nice-to-have; fail silently for guests.
      }
    };
    loadPreview();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-text">
          <span className="landing-eyebrow">Roam Nepal</span>
          <h1>Discover Nepal's hidden gems, shared by travelers like you.</h1>
          <p>
            From quiet lakeside villages to viewpoints without a name on any
            map, Roam Nepal is where travelers post, review, and pass on the
            places worth the detour.
          </p>
          <div className="landing-cta">
            
            <Link to="/login" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
          <Link to="/home" className="landing-browse-link">
            Just want to look around? Browse without an account →
          </Link>
        </div>
        <div className="landing-hero-art" aria-hidden="true">
          <div className="landing-hero-shape landing-hero-shape-1" />
          <div className="landing-hero-shape landing-hero-shape-2" />
          <div className="landing-hero-shape landing-hero-shape-3" />
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="landing-feature-card">
            <div className="landing-feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      {preview.length > 0 && (
        <section className="landing-preview">
          <div className="landing-preview-header">
            <h2>Trending right now</h2>
            <p>A few places other travelers have been posting about.</p>
          </div>
          <div className="landing-preview-grid">
            {preview.map((place) => (
              <div key={place.id} className="landing-preview-card">
                {place.image ? (
                  <img src={getImageUrl(place.image)} alt={place.name} />
                ) : (
                  <div className="landing-preview-noimg">No image</div>
                )}
                <span>{place.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      
    </div>
  );
};

export default Landing;
