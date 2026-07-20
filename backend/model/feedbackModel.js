const pool = require("../dataBase/db");

const createFeedback = async (userId, name, email, message) => {
  const result = await pool.query(
    "INSERT INTO feedback (user_id, name, email, message) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, name, email, message]
  );
  return result.rows[0];
};

const getAllFeedback = async () => {
  const result = await pool.query(
    `SELECT f.*, u.name AS user_name, u.email AS user_email
     FROM feedback f
     LEFT JOIN users u ON f.user_id = u.id
     ORDER BY f.created_at DESC`
  );
  return result.rows;
};

module.exports = { createFeedback, getAllFeedback };
