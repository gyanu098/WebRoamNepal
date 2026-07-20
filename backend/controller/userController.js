const { createUser, existingUser , getAllusers , getUserById , deleteUserById ,updateUserById, updateProfileById, updatePasswordByEmail} = require("../model/userModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const pool = require("../dataBase/db");
const { sendPasswordResetEmail } = require("../utils/mailer");
const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const image = req.file ? req.file.filename : null;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "field empty",
      });
    }
    const alreadyRegistered = await existingUser(email);
    if (alreadyRegistered) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashpassword , image);
    if (user) {
      const { password: _password, ...safeUser } = user;
      res.status(201).json({
        message: "Created Successfully",
        user: safeUser,
      });
    }
  } catch (e) { 
    res.status(500).json({
      message: "unsuccessful",
      e: e.message,
    });
  }
};




const login = async (req, res) => {
  try {
    const { email, password :inputPassword} = req.body;
    if (!email || !inputPassword) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const user = await existingUser(email);
    if (!user) {
      return res.status(401).json({
        message: "email is not registered",
      });
    }
    const isMatched = await bcrypt.compare(inputPassword, user.password);
    if (!isMatched) {
      return res.status(401).json({
        message: "password doesnot matched",
      });

    }

    const token = JWT.sign({
      id : user.id,
      email : user.email,
      role : user.role,
    },
    process.env.JWT_SECRET,
  {
    expiresIn:"1d",
  },
  );
  const {password, ...safeUser}= user;
    if (user) {
      res.status(200).json({
        message: "login successful",
        user: safeUser,
        token
      });
    }
  } catch (e) {
    res.json({
      message: "not successful",
      e: e.message,
    });
  }
};

const getAllusersFromTheDB = async (req, res) => {
  try {
    const users = await getAllusers();
    if(!users || users.length === 0){
      return res.status(400).json({
        message: "no users found",
      });
    }
    if(users){
      res.status(200).json({
        message: "successful",
        users: users,
      });
    }
  } catch (e) {
    res.status(500).json({
      message: "unsucceful",
      e: e.message
    });
  }
};

const getUserByIdDB = async (req, res) => {
try{
  const {id} =req.params;
  const user = await getUserById(id);
  if(!user){
    return res.status(404).json({
      message: "user not found",
    });
  }
  res.status(200).json({
    message: "successful",
    user: user,
  });

}catch(e){
  res.status(500).json({
    message: "unsucceful",
    e: e.message
  });
}

};

const deleteUserByIdDB = async (req, res) => {
  try{
    const {id} =req.params;
    const Users = await deleteUserById(id);
    if(!Users){
      return res.status(404).json({
        message: "user not found",
      });
    }
    res.status(200).json({
      message: "user deleted successfully",
      user: Users,
    });

  }catch(e){
    res.status(500).json({
      message: "unsucceful",
      e: e.message
    });

  }
};



const updateUserByIdDB = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const image = req.file ? req.file.filename : req.body.image || null; // handle uploaded file or text
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (role && role !== "user" && role !== "admin") {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }
    if (role === "user" && Number(id) === req.user.id) {
      return res.status(400).json({ message: "You can't remove your own admin access" });
    }

    const user = await updateUserById(id, name, email, image, hashedPassword, role);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    res.status(200).json({
      message: "user updated successfully",
      user: user,
    });
  } catch (e) {
    res.status(500).json({
      message: "unsuccessful",
      error: e.message,
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, bio, location } = req.body;
    const image = req.file ? req.file.filename : req.body.image || null;

    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2, bio=$3, location=$4, image=COALESCE($5, image) WHERE id=$6 RETURNING id, name, email, image, role, bio, location",
      [name, email, bio, location, image, userId]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const user = await existingUser(req.user.email);
    const isMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await updatePasswordByEmail(user.email, hashed);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to change password", error: e.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await existingUser(email);
    // Respond the same way whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails.
    if (user) {
      const resetToken = JWT.sign(
        { email: user.email, purpose: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetLink);
    }

    res.status(200).json({ message: "If that email is registered, a reset link has been sent." });
  } catch (e) {
    res.status(500).json({ message: "Failed to process request", error: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    let decoded;
    try {
      decoded = JWT.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Reset link is invalid" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await updatePasswordByEmail(decoded.email, hashed);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to reset password", error: e.message });
  }
};

module.exports = {
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
};

