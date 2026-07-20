const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads"); // multer middleware
const { verifyToken } = require("../middleware/verifyToken");





const {
  addPlace,
  getPlaces,
  getPlace,
  updatePlace,
  deletePlace,
} = require("../controller/placeController");

// Add a new place (photo + description)
router.post("/addPlace", verifyToken, upload.single("image"), addPlace);

// Get all places
router.get("/getAllPlaces", getPlaces);

// Get single place by ID
router.get("/getPlaceById/:id", getPlace);

// Update place
router.put("/updatePlace/:id", verifyToken, upload.single("image"), updatePlace);

// Delete place
router.delete("/deletePlace/:id", verifyToken, deletePlace);

module.exports = router;
