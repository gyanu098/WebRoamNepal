const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  postMessage,
  fetchConversation,
  fetchConversations,
  editMessage,
  removeMessage,
} = require("../controller/messageController");

router.post("/send", verifyToken, postMessage);
router.get("/conversations", verifyToken, fetchConversations);
router.get("/conversation/:otherUserId", verifyToken, fetchConversation);
router.put("/update/:id", verifyToken, editMessage);
router.delete("/delete/:id", verifyToken, removeMessage);

module.exports = router;
