const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  fetchMyNotifications,
  readNotification,
  readAllNotifications,
} = require("../controller/notificationController");

router.get("/mine", verifyToken, fetchMyNotifications);
router.put("/mine/:id/read", verifyToken, readNotification);
router.put("/mine/read-all", verifyToken, readAllNotifications);

module.exports = router;
