const {
  addFavorite,
  removeFavorite,
  getFavoritePlaceIds,
  getFavoritePlaces,
} = require("../model/favoriteModel");
const { getPlaceById } = require("../model/placeModel");
const { createNotification } = require("../model/notificationModel");

const saveFavorite = async (req, res) => {
  try {
    const { placeId } = req.body;
    if (!placeId) {
      return res.status(400).json({ message: "placeId is required" });
    }
    const saved = await addFavorite(req.user.id, placeId);

    if (saved) {
      const place = await getPlaceById(placeId);
      if (place?.uploader_id && place.uploader_id !== req.user.id) {
        await createNotification(
          place.uploader_id,
          `${req.user.email} saved "${place.name}" to their favorites`,
          placeId
        );
      }
    }

    res.status(201).json({ message: "Place saved to favorites" });
  } catch (e) {
    res.status(500).json({ message: "Failed to save favorite", error: e.message });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const { placeId } = req.params;
    await removeFavorite(req.user.id, placeId);
    res.status(200).json({ message: "Place removed from favorites" });
  } catch (e) {
    res.status(500).json({ message: "Failed to remove favorite", error: e.message });
  }
};

const fetchMyFavoriteIds = async (req, res) => {
  try {
    const placeIds = await getFavoritePlaceIds(req.user.id);
    res.status(200).json({ placeIds });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch favorites", error: e.message });
  }
};

const fetchMyFavoritePlaces = async (req, res) => {
  try {
    const places = await getFavoritePlaces(req.user.id);
    res.status(200).json({ places });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch favorites", error: e.message });
  }
};

module.exports = { saveFavorite, deleteFavorite, fetchMyFavoriteIds, fetchMyFavoritePlaces };
