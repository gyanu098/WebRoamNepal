const pool = require("../dataBase/db");

const sendMessage = async (senderId, receiverId, content) => {
  const result = await pool.query(
    "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
    [senderId, receiverId, content]
  );
  return result.rows[0];
};

const getConversation = async (userA, userB) => {
  const result = await pool.query(
    `SELECT m.*, u.name AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE (m.sender_id = $1 AND m.receiver_id = $2)
        OR (m.sender_id = $2 AND m.receiver_id = $1)
     ORDER BY m.created_at ASC`,
    [userA, userB]
  );
  return result.rows;
};

// One row per person the user has exchanged messages with, with the most
// recent message and how many of their messages to this user are unread.
const getConversationList = async (userId) => {
  const result = await pool.query(
    `SELECT
       other.id AS user_id,
       other.name AS user_name,
       other.image AS user_image,
       last_msg.content AS last_message,
       last_msg.created_at AS last_message_at,
       COALESCE(unread.count, 0) AS unread_count
     FROM (
       SELECT DISTINCT
         CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id
       FROM messages
       WHERE sender_id = $1 OR receiver_id = $1
     ) AS partners
     JOIN users other ON other.id = partners.other_user_id
     JOIN LATERAL (
       SELECT content, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = partners.other_user_id)
          OR (sender_id = partners.other_user_id AND receiver_id = $1)
       ORDER BY created_at DESC
       LIMIT 1
     ) AS last_msg ON true
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS count
       FROM messages
       WHERE sender_id = partners.other_user_id AND receiver_id = $1 AND is_read = FALSE
     ) AS unread ON true
     ORDER BY last_msg.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const markConversationRead = async (userId, otherUserId) => {
  await pool.query(
    "UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE",
    [otherUserId, userId]
  );
};

const getMessageById = async (id) => {
  const result = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
  return result.rows[0];
};

const updateMessageById = async (id, content) => {
  const result = await pool.query(
    "UPDATE messages SET content = $1, is_edited = TRUE WHERE id = $2 RETURNING *",
    [content, id]
  );
  return result.rows[0];
};

const deleteMessageById = async (id) => {
  const result = await pool.query("DELETE FROM messages WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationList,
  markConversationRead,
  getMessageById,
  updateMessageById,
  deleteMessageById,
};
