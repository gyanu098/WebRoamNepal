const jwt = require("jsonwebtoken");
const { createFeedback, getAllFeedback } = require("../model/feedbackModel");

// Feedback can be submitted by logged-in or anonymous visitors. If a valid
// token is present we attach the user id; an invalid/missing token just
// means the submission is treated as anonymous rather than being rejected.
const getOptionalUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const userId = getOptionalUserId(req);
    const feedback = await createFeedback(userId, name || null, email || null, message.trim());
    res.status(201).json({ message: "Thanks for your feedback!", feedback });
  } catch (e) {
    res.status(500).json({ message: "Failed to submit feedback", error: e.message });
  }
};

const fetchAllFeedback = async (req, res) => {
  try {
    const feedback = await getAllFeedback();
    res.status(200).json({ feedback });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch feedback", error: e.message });
  }
};

module.exports = { submitFeedback, fetchAllFeedback };
