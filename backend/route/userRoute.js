const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const { isAdmin } = require("../middleware/authMiddleware");
const { verifyToken } = require("../middleware/verifyToken");

// Import controller functions
const {
  addUser,
  login,
  getAllusersFromTheDB,
  getUserByIdDB,
  deleteUserByIdDB,
  updateUserByIdDB,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controller/userController");

// Routes
router.post("/create", upload.single("image"), addUser);
router.post("/login", login);

router.get("/getAll", verifyToken, isAdmin, getAllusersFromTheDB);
router.get("/getUserById/:id", verifyToken, isAdmin, getUserByIdDB);
router.delete("/deleteUserById/:id", verifyToken, isAdmin, deleteUserByIdDB);
router.put("/updateUserById/:id", verifyToken, isAdmin, upload.single("image"), updateUserByIdDB);

// Profile routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("image"), updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Password recovery routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
