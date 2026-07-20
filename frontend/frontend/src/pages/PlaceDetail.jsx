import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  addFavorite,
  addReview,
  deletePlaceById,
  deleteReview,
  getImageUrl,
  getMyFavoriteIds,
  getPlaceById,
  getReviews,
  removeFavorite,
  updatePlaceById,
  updateReview,
} from "../service/Api";
import { useAuth } from "../context/AuthContext";
import PlacesMap from "../component/PlacesMap";
import MapPicker from "../component/MapPicker";
import "./Home.css";
import "./PlaceDetail.css";

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: "", comment: "" });
  const [isFavorited, setIsFavorited] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: "", comment: "" });

  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", location: "" });
  const [image, setImage] = useState(null);
  const [coords, setCoords] = useState(null);

  const fetchPlace = async () => {
    const res = await getPlaceById(id);
    setPlace(res.data.place);
  };

  const fetchReviews = async () => {
    const res = await getReviews(id);
    setReviews(res.data.reviews || []);
  };

  useEffect(() => {
    const loadOnMount = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchPlace(), fetchReviews()]);
      } catch {
        toast.error("Failed to load this place");
      } finally {
        setIsLoading(false);
      }
    };
    loadOnMount();
  }, [id]);

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!isAuthenticated) {
        setIsFavorited(false);
        return;
      }
      try {
        const res = await getMyFavoriteIds();
        setIsFavorited(res.data.placeIds.includes(Number(id)));
      } catch {
        // Non-critical: the save button just won't be pre-marked as saved.
      }
    };
    loadFavoriteStatus();
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save places");
      navigate("/login");
      return;
    }
    try {
      if (isFavorited) {
        await removeFavorite(id);
        setIsFavorited(false);
      } else {
        await addFavorite(id);
        setIsFavorited(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update favorites");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to leave a review");
      navigate("/login");
      return;
    }
    if (!newReview.rating) {
      toast.error("Please choose a rating");
      return;
    }
    try {
      await addReview({ placeId: id, rating: newReview.rating, comment: newReview.comment });
      toast.success("Review added!");
      setNewReview({ rating: "", comment: "" });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add review");
    }
  };

  const openReviewEdit = (review) => {
    setEditingReviewId(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment || "" });
  };

  const cancelReviewEdit = () => {
    setEditingReviewId(null);
    setEditReviewData({ rating: "", comment: "" });
  };

  const handleReviewEditSubmit = async (e, reviewId) => {
    e.preventDefault();
    if (!editReviewData.rating) {
      toast.error("Please choose a rating");
      return;
    }
    try {
      await updateReview(reviewId, {
        rating: editReviewData.rating,
        comment: editReviewData.comment,
      });
      toast.success("Review updated");
      cancelReviewEdit();
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const openEditForm = () => {
    setFormData({
      name: place.name || "",
      description: place.description || "",
      location: place.location || "",
    });
    setImage(null);
    setCoords(
      place.latitude && place.longitude
        ? { lat: Number(place.latitude), lng: Number(place.longitude) }
        : null
    );
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("location", formData.location);
      if (image) data.append("image", image);
      if (coords) {
        data.append("latitude", coords.lat);
        data.append("longitude", coords.lng);
      }
      await updatePlaceById(id, data);
      toast.success("Place updated successfully");
      setShowEditForm(false);
      fetchPlace();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update place");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await deletePlaceById(id);
      toast.success("Place deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete place");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!place) return <p>Place not found.</p>;

  const canManage = user && (user.role === "admin" || user.id === place.uploader_id);
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="place-detail">
      <Link to="/" className="back-link">← Back to feed</Link>

      {place.image ? (
        <img src={getImageUrl(place.image)} alt={place.name} className="detail-img" />
      ) : (
        <div className="no-img detail-img">No Image</div>
      )}

      <h2>{place.name}</h2>
      <p className="detail-description">{place.description}</p>
      <p className="location">{place.location}</p>
      <p className="uploader"><strong>{place.uploader_name}</strong></p>
      <p className="avg-rating">
        {avgRating ? `⭐ ${avgRating} (${reviews.length} review${reviews.length === 1 ? "" : "s"})` : "No ratings yet"}
      </p>

      <div className="actions">
        <button type="button" className="save-btn" onClick={toggleFavorite}>
          {isFavorited ? "★ Saved" : "☆ Save"}
        </button>
        {user && place.uploader_id && user.id !== place.uploader_id && (
          <button
            type="button"
            className="save-btn"
            onClick={() => navigate(`/messages/${place.uploader_id}`)}
          >
            ✉ Message {place.uploader_name}
          </button>
        )}
      </div>

      {canManage && (
        <div className="actions">
          <button type="button" onClick={openEditForm}>Edit</button>
          <button type="button" onClick={handleDelete}>Delete</button>
        </div>
      )}

      {place.latitude && place.longitude && <PlacesMap places={[place]} />}

      <div className="reviews">
        <h4>Reviews</h4>
        {reviews.length > 0 ? (
          reviews.map((r) => {
            const canManageReview = user && (user.role === "admin" || user.id === r.user_id);
            if (editingReviewId === r.id) {
              return (
                <form
                  key={r.id}
                  className="review-form review-edit-form"
                  onSubmit={(e) => handleReviewEditSubmit(e, r.id)}
                >
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editReviewData.rating}
                    onChange={(e) =>
                      setEditReviewData((prev) => ({ ...prev, rating: e.target.value }))
                    }
                    placeholder="Rating (1-5)"
                  />
                  <input
                    type="text"
                    value={editReviewData.comment}
                    onChange={(e) =>
                      setEditReviewData((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Comment"
                  />
                  <div className="actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={cancelReviewEdit}>Cancel</button>
                  </div>
                </form>
              );
            }
            return (
              <div key={r.id} className="review-row">
                <p>
                  <strong>{r.user_name}</strong>: {r.comment} ({r.rating}⭐)
                </p>
                {canManageReview && (
                  <div className="review-row-actions">
                    <button type="button" onClick={() => openReviewEdit(r)}>Edit</button>
                    <button type="button" onClick={() => handleReviewDelete(r.id)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No reviews yet</p>
        )}

        <form onSubmit={handleReviewSubmit} className="review-form">
          <input
            type="number"
            min="1"
            max="5"
            value={newReview.rating}
            onChange={(e) => setNewReview((prev) => ({ ...prev, rating: e.target.value }))}
            placeholder="Rating (1-5)"
          />
          <input
            type="text"
            value={newReview.comment}
            onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder="Comment"
          />
          <button type="submit">Add Review</button>
        </form>
      </div>

      {showEditForm && (
        <div className="overlay">
          <div className="card-box">
            <h3>Edit Place</h3>
            <form onSubmit={handleEditSubmit}>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
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
                <button type="submit">Save changes</button>
                <button type="button" onClick={() => setShowEditForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetail;
