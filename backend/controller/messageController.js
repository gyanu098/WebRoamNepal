const {
  sendMessage,
  getConversation,
  getConversationList,
  markConversationRead,
  getMessageById,
  updateMessageById,
  deleteMessageById,
} = require("../model/messageModel");
const { createNotification } = require("../model/notificationModel");

const postMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }
    if (Number(receiverId) === req.user.id) {
      return res.status(400).json({ message: "You can't message yourself" });
    }

    const message = await sendMessage(req.user.id, receiverId, content.trim());
    await createNotification(receiverId, `New message from ${req.user.email}`);
    res.status(201).json({ message: "Message sent", data: message });
  } catch (e) {
    res.status(500).json({ message: "Failed to send message", error: e.message });
  }
};

const fetchConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await getConversation(req.user.id, otherUserId);
    await markConversationRead(req.user.id, otherUserId);
    res.status(200).json({ messages });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch conversation", error: e.message });
  }
};

const fetchConversations = async (req, res) => {
  try {
    const conversations = await getConversationList(req.user.id);
    res.status(200).json({ conversations });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch conversations", error: e.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const existing = await getMessageById(id);
    if (!existing) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (existing.sender_id !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    const message = await updateMessageById(id, content.trim());
    res.status(200).json({ message: "Message updated", data: message });
  } catch (e) {
    res.status(500).json({ message: "Failed to update message", error: e.message });
  }
};

const removeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getMessageById(id);
    if (!existing) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (existing.sender_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const message = await deleteMessageById(id);
    res.status(200).json({ message: "Message deleted", data: message });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete message", error: e.message });
  }
};

module.exports = { postMessage, fetchConversation, fetchConversations, editMessage, removeMessage };
