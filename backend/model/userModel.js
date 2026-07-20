// userModel.js
const pool = require("../dataBase/db");





// Create a new user
const createUser = async (name, email, password, image) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password, image) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, password, image]
  );
  return result.rows[0];
};

// Find existing user by email
const existingUser = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

const SAFE_COLUMNS = "id, name, email, image, role, bio, location";

const getAllusers = async () => {
  const result = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users`);
  return result.rows;
}


const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const deleteUserById = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING ${SAFE_COLUMNS}`,
    [id]
  );
  return result.rows[0];
};

const updateUserById = async ( id, name, email, image, hashedPassword, role) => {
  const result = await pool.query(
    `UPDATE users SET name = $1, email = $2, image = COALESCE($3, image), password = COALESCE($4, password),
     role = COALESCE($5, role)
     WHERE id = $6 RETURNING ${SAFE_COLUMNS}`,
    [name, email, image, hashedPassword || null, role || null, id]
  );
  return result.rows[0];
};

const updateProfileById = async (id, name, email, image, bio, location) => {
  const result = await pool.query(
    `UPDATE users SET name = $1, email = $2, image = COALESCE($3, image), bio = $4, location = $5
     WHERE id = $6 RETURNING ${SAFE_COLUMNS}`,
    [name, email, image, bio, location, id]
  );
  return result.rows[0];
};

const updatePasswordByEmail = async (email, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users SET password = $1 WHERE email = $2 RETURNING ${SAFE_COLUMNS}`,
    [hashedPassword, email]
  );
  return result.rows[0];
};





module.exports = { createUser, existingUser , getAllusers , getUserById, deleteUserById, updateUserById, updateProfileById, updatePasswordByEmail};
