const {
  addReview,
  getReviewsByPlace,
  getReviewById,
  updateReviewById,
  deleteReviewById,
} = require("../model/reviewModel");
const { getPlaceById } = require("../model/placeModel");
const { createNotification } = require("../model/notificationModel");

const isOwnerOrAdmin = (review, user) =>
  user && (user.role === "admin" || review.user_id === user.id);

const parseRating = (rating) => {
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return null;
  }
  return numericRating;
};

const postReview = async (req, res) => {
  try {
    const { placeId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!placeId || !rating) {
      return res.status(400).json({ message: "Missing placeId or rating" });
    }
    const numericRating = parseRating(rating);
    if (numericRating === null) {
      return res.status(400).json({ message: "Rating must be a whole number between 1 and 5" });
    }

    const review = await addReview(placeId, userId, numericRating, comment);

    const place = await getPlaceById(placeId);
    if (place?.uploader_id && place.uploader_id !== userId) {
      await createNotification(
        place.uploader_id,
        `${req.user.email} left a ${numericRating}⭐ review on "${place.name}"`,
        placeId
      );
    }

    res.status(201).json({ message: "Review added", review });
  } catch (e) {
    res.status(500).json({ message: "Failed to add review", error: e.message });
  }
};

const fetchReviews = async (req, res) => {
  try {
    const { placeId } = req.params;
    const reviews = await getReviewsByPlace(placeId);
    res.status(200).json({ reviews });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch reviews", error: e.message });
  }
};

const editReview = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getReviewById(id);
    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({ message: "You can only edit your own reviews" });
    }

    const { rating, comment } = req.body;
    const numericRating = parseRating(rating);
    if (numericRating === null) {
      return res.status(400).json({ message: "Rating must be a whole number between 1 and 5" });
    }

    const review = await updateReviewById(id, numericRating, comment ?? existing.comment);
    res.status(200).json({ message: "Review updated", review });
  } catch (e) {
    res.status(500).json({ message: "Failed to update review", error: e.message });
  }
};

const removeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getReviewById(id);
    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    const review = await deleteReviewById(id);
    res.status(200).json({ message: "Review deleted", review });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete review", error: e.message });
  }
};

module.exports = { postReview, fetchReviews, editReview, removeReview };
