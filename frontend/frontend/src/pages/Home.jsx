import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { addPlace, getAllPlaces, getImageUrl } from "../service/Api";
import { useAuth } from "../context/AuthContext";
import PlacesMap from "../component/PlacesMap";
import MapPicker from "../component/MapPicker";
import "./Home.css";

const EMPTY_FORM = { name: "", description: "", location: "" };

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [coords, setCoords] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const fetchPlaces = async () => {
    const response = await getAllPlaces();
    setPlaces(response.data.places || []);
  };

  useEffect(() => {
    const loadOnMount = async () => {
      try {
        await fetchPlaces();
      } catch {
        toast.error("Failed to load places");
      }
    };
    loadOnMount();
  }, []);

  const handleImageUpload = (e) => setImage(e.target.files[0]);

  const openAddForm = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to share a hidden gem");
      navigate("/login");
      return;
    }
    setFormData(EMPTY_FORM);
    setImage(null);
    setCoords(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setImage(null);
    setCoords(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    if (!image) {
      toast.error("Please choose a photo to upload");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("image", image);
      if (coords) {
        data.append("latitude", coords.lat);
        data.append("longitude", coords.lng);
      }

      await addPlace(data);
      toast.success("Place uploaded successfully");
      closeForm();
      fetchPlaces();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const discoverablePlaces = places.filter((p) => !user || p.uploader_id !== user.id);

  const filteredPlaces = discoverablePlaces.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [p.name, p.location, p.description].some((field) =>
      field?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">Roam Nepal</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, region, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="icons">
          <button type="button" onClick={() => navigate("/profile")}>👤</button>
        </div>
      </header>

      <main className="content">
        <div className="content-header">
          <h2>Just for you</h2>
          <p>Discover inspiring places and share your thoughts.</p>
        </div>

        <PlacesMap places={filteredPlaces} />

        {filteredPlaces.length === 0 && (
          <p className="no-results">
            {searchTerm ? `No places match "${searchTerm}"` : "No places posted yet"}
          </p>
        )}

        <div className="feed">
          {filteredPlaces.map((p) => (
            <button
              key={p.id}
              type="button"
              className="card card-minimal"
              onClick={() => navigate(`/places/${p.id}`)}
            >
              {p.image ? (
                <img src={getImageUrl(p.image)} alt={p.name} className="card-img" />
              ) : (
                <div className="no-img">No Image</div>
              )}
              <h3>{p.name}</h3>
            </button>
          ))}
        </div>
      </main>

      <button className="add-btn" type="button" onClick={openAddForm}>
        +
      </button>

      {showForm && (
        <div className="overlay">
          <div className="card-box">
            <h3>Add New Place</h3>
            <form onSubmit={handleSubmit}>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <input
                type="text"
                placeholder="Place Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <textarea
                rows="4"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <MapPicker value={coords} onPick={setCoords} />
              <div className="actions">
                <button type="submit">Upload</button>
                <button type="button" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
