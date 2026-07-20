import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getImageUrl, getMyFavorites, removeFavorite } from "../service/Api";
import "./Home.css";

const Favorites = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await getMyFavorites();
        setPlaces(res.data.places || []);
      } catch {
        toast.error("Failed to load your favorites");
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const handleRemove = async (placeId) => {
    try {
      await removeFavorite(placeId);
      setPlaces((prev) => prev.filter((p) => p.id !== placeId));
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove favorite");
    }
  };

  if (isLoading) {
    return <p>Loading your favorites...</p>;
  }

  return (
    <div className="home-container">
      <div className="content-header">
        <h2>My Favorites</h2>
        <p>Hidden gems you've saved for later.</p>
      </div>

      {places.length === 0 && <p className="no-results">You haven't saved any places yet</p>}

      <div className="feed">
        {places.map((p) => (
          <div key={p.id} className="card">
            {p.image ? (
              <img src={getImageUrl(p.image)} alt={p.name} className="card-img" />
            ) : (
              <div className="no-img">No Image</div>
            )}
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p className="location">{p.location}</p>
            <p className="uploader">
              <strong>{p.uploader_name}</strong>
            </p>
            <button type="button" className="save-btn" onClick={() => handleRemove(p.id)}>
              ★ Remove from favorites
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
