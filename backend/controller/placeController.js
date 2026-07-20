// backend/controller/placeController.js
const {
  createPlace,
  getAllPlaces,
  getPlaceById,
  deletePlaceById,
  updatePlaceById,
} = require("../model/placeModel");

// Add a new place
const addPlace = async (req, res) => {
  try {
    const { name, description, location, latitude, longitude } = req.body;
    const image = req.file ? req.file.filename : null;
    const uploaderId = req.user?.id || null;

    if (!name || !description || !image) {
      return res.status(400).json({ message: "Name, description or image missing" });
    }

    const place = await createPlace(name, description, location, image, uploaderId, latitude, longitude);
    res.status(201).json({ message: "Place added successfully", place });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
};

// Get all places
const getPlaces = async (req, res) => {
  try {
    const places = await getAllPlaces();
    res.status(200).json({ message: "Success", places });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch places", error: e.message });
  }
};



// Get place by ID
const getPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await getPlaceById(id);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }
    res.status(200).json({ message: "Success", place });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch place", error: e.message });
  }
};

const isOwnerOrAdmin = (place, user) =>
  user && (user.role === "admin" || place.uploader_id === user.id);

// Update place
const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getPlaceById(id);
    if (!existing) {
      return res.status(404).json({ message: "Place not found" });
    }
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const { name, description, location, latitude, longitude } = req.body;
    const image = req.file ? req.file.filename : req.body.image || existing.image;

    const place = await updatePlaceById(
      id,
      name || existing.name,
      description || existing.description,
      location ?? existing.location,
      image,
      latitude,
      longitude
    );
    res.status(200).json({ message: "Place updated successfully", place });
  } catch (e) {
    res.status(500).json({ message: "Failed to update place", error: e.message });
  }
};

// Delete place
const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getPlaceById(id);
    if (!existing) {
      return res.status(404).json({ message: "Place not found" });
    }
    if (!isOwnerOrAdmin(existing, req.user)) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    const place = await deletePlaceById(id);
    res.status(200).json({ message: "Place deleted successfully", place });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete place", error: e.message });
  }
};

module.exports = { addPlace, getPlaces, getPlace, updatePlace, deletePlace };
