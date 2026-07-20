const {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../model/notificationModel");

const fetchMyNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsForUser(req.user.id);
    const unreadCount = await getUnreadCount(req.user.id);
    res.status(200).json({ notifications, unreadCount });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch notifications", error: e.message });
  }
};

const readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await markAsRead(id, req.user.id);
    res.status(200).json({ message: "Marked as read" });
  } catch (e) {
    res.status(500).json({ message: "Failed to update notification", error: e.message });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (e) {
    res.status(500).json({ message: "Failed to update notifications", error: e.message });
  }
};

module.exports = { fetchMyNotifications, readNotification, readAllNotifications };
