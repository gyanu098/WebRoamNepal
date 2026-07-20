const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  saveFavorite,
  deleteFavorite,
  fetchMyFavoriteIds,
  fetchMyFavoritePlaces,
} = require("../controller/favoriteController");

router.post("/add", verifyToken, saveFavorite);
router.delete("/remove/:placeId", verifyToken, deleteFavorite);
router.get("/mine", verifyToken, fetchMyFavoritePlaces);
router.get("/mine/ids", verifyToken, fetchMyFavoriteIds);

module.exports = router;
