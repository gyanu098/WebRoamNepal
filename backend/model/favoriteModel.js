const pool = require("../dataBase/db");

const addFavorite = async (userId, placeId) => {
  const result = await pool.query(
    `INSERT INTO favorites (user_id, place_id) VALUES ($1, $2)
     ON CONFLICT (user_id, place_id) DO NOTHING RETURNING *`,
    [userId, placeId]
  );
  return result.rows[0];
};

const removeFavorite = async (userId, placeId) => {
  const result = await pool.query(
    "DELETE FROM favorites WHERE user_id = $1 AND place_id = $2 RETURNING *",
    [userId, placeId]
  );
  return result.rows[0];
};

const getFavoritePlaceIds = async (userId) => {
  const result = await pool.query("SELECT place_id FROM favorites WHERE user_id = $1", [userId]);
  return result.rows.map((r) => r.place_id);
};

const getFavoritePlaces = async (userId) => {
  const result = await pool.query(
    `SELECT p.*, u.name AS uploader_name
     FROM favorites f
     JOIN places p ON f.place_id = p.id
     LEFT JOIN users u ON p.uploader_id = u.id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { addFavorite, removeFavorite, getFavoritePlaceIds, getFavoritePlaces };
