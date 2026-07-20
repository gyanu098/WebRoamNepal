import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getProfile, getAllPlaces, getMyFavorites, getImageUrl } from "../service/Api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [myPlaces, setMyPlaces] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadOnMount = async () => {
      try {
        const profileRes = await getProfile();
        setUser(profileRes.data.user);

        const [placesRes, favoritesRes] = await Promise.all([
          getAllPlaces(),
          getMyFavorites(),
        ]);
        const mine = (placesRes.data.places || []).filter(
          (p) => p.uploader_id === profileRes.data.user.id
        );
        setMyPlaces(mine);
        setFavorites(favoritesRes.data.places || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      }
    };

    loadOnMount();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  const activeGrid = activeTab === "posts" ? myPlaces : favorites;

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-sidebar-header">
          {user.image ? (
            <img src={getImageUrl(user.image)} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar avatar-placeholder">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="profile-menu">
            <button type="button" onClick={() => setMenuOpen((prev) => !prev)} aria-label="More options">
              ⋮
            </button>
            {menuOpen && (
              <div className="profile-menu-dropdown">
                <button type="button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <h3 className="profile-name">{user.name}</h3>
        {user.bio && <p className="profile-tagline">{user.bio}</p>}
        {user.location && <p className="profile-location">📍 {user.location}</p>}
        <p className="profile-contact">{user.email}</p>

        <div className="profile-stats">
          <div className="stat">
            <strong>{myPlaces.length}</strong>
            <span>Posts</span>
          </div>
          <div className="stat">
            <strong>{favorites.length}</strong>
            <span>Saved</span>
          </div>
        </div>

        <button className="btn edit-profile-btn" type="button" onClick={() => navigate("/edit-profile")}>
          Edit Profile
        </button>
      </aside>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            type="button"
            className={activeTab === "posts" ? "active" : ""}
            onClick={() => setActiveTab("posts")}
          >
            ▦ Posts
          </button>
          <button
            type="button"
            className={activeTab === "favourites" ? "active" : ""}
            onClick={() => setActiveTab("favourites")}
          >
            ♡ Favourites
          </button>
        </div>

        {activeGrid.length === 0 ? (
          <p className="no-results">
            {activeTab === "posts" ? "No posts yet" : "No saved places yet"}
          </p>
        ) : (
          <div className="profile-grid">
            {activeGrid.map((p) => (
              <button
                key={p.id}
                type="button"
                className="profile-grid-item"
                onClick={() => navigate(`/places/${p.id}`)}
              >
                {p.image ? (
                  <img src={getImageUrl(p.image)} alt={p.name} />
                ) : (
                  <div className="no-img">No Image</div>
                )}
                <span className="profile-grid-item-name">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
