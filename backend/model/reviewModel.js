const pool = require("../dataBase/db");

const addReview = async (placeId, userId, rating, comment) => {
  const result = await pool.query(
    "INSERT INTO reviews (place_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
    [placeId, userId, rating, comment]
  );
  return result.rows[0];
};

const getReviewsByPlace = async (placeId) => {
  const result = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.place_id = $1
     ORDER BY r.created_at DESC`,
    [placeId]
  );
  return result.rows;
};

const getReviewById = async (id) => {
  const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [id]);
  return result.rows[0];
};

const updateReviewById = async (id, rating, comment) => {
  const result = await pool.query(
    "UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 RETURNING *",
    [rating, comment, id]
  );
  return result.rows[0];
};

const deleteReviewById = async (id) => {
  const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

module.exports = {
  addReview,
  getReviewsByPlace,
  getReviewById,
  updateReviewById,
  deleteReviewById,
};
