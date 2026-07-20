const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { isAdmin } = require("../middleware/authMiddleware");
const { submitFeedback, fetchAllFeedback } = require("../controller/feedbackController");

router.post("/add", submitFeedback);
router.get("/all", verifyToken, isAdmin, fetchAllFeedback);

module.exports = router;
