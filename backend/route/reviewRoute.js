


const express = require("express");
const { postReview, fetchReviews, editReview, removeReview } = require("../controller/reviewController");
const { verifyToken } = require("../middleware/verifyToken");
const router = express.Router();

router.post("/addReview", verifyToken, postReview);
router.get("/getReviews/:placeId", fetchReviews);
router.put("/updateReview/:id", verifyToken, editReview);
router.delete("/deleteReview/:id", verifyToken, removeReview);

module.exports = router;
