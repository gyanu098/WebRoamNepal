// placeModel.js
const pool = require("../dataBase/db");

// Create a new place (with name, description, location, image, uploader)
const createPlace = async (name, description, location, image, uploaderId, latitude, longitude) => {
  const result = await pool.query(
    "INSERT INTO places (name, description, location, image, uploader_id, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, description, location, image, uploaderId, latitude ?? null, longitude ?? null]
  );
  return result.rows[0];
};

// Get all places with uploader info
const getAllPlaces = async () => {
  const result = await pool.query(`
    SELECT p.*, u.name AS uploader_name
    FROM places p
    LEFT JOIN users u ON p.uploader_id = u.id
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

// Get place by ID (with uploader info)
const getPlaceById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, u.name AS uploader_name
     FROM places p
     LEFT JOIN users u ON p.uploader_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
};

// Delete place by ID
const deletePlaceById = async (id) => {
  const result = await pool.query(
    "DELETE FROM places WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// Update place by ID
const updatePlaceById = async (id, name, description, location, image, latitude, longitude) => {
  const result = await pool.query(
    `UPDATE places SET name = $1, description = $2, location = $3, image = $4,
     latitude = COALESCE($5, latitude), longitude = COALESCE($6, longitude)
     WHERE id = $7 RETURNING *`,
    [name, description, location, image, latitude ?? null, longitude ?? null, id]
  );
  return result.rows[0];
};

module.exports = {
  createPlace,
  getAllPlaces,
  getPlaceById,
  deletePlaceById,
  updatePlaceById,
};
