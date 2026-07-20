const pool = require("../dataBase/db");

const createNotification = async (userId, message, placeId = null) => {
  const result = await pool.query(
    "INSERT INTO notifications (user_id, message, place_id) VALUES ($1, $2, $3) RETURNING *",
    [userId, message, placeId]
  );
  return result.rows[0];
};

const getNotificationsForUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
  return result.rows;
};

const getUnreadCount = async (userId) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE",
    [userId]
  );
  return Number(result.rows[0].count);
};

const markAsRead = async (id, userId) => {
  const result = await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0];
};

const markAllAsRead = async (userId) => {
  await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", [userId]);
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
