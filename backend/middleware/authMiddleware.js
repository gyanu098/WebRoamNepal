const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) return res.status(403).json({ message: "Invalid token format" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded; // { id, role }
    next();
  });
};
const isAdmin = (req, res, next) => {
    try{
        if(req.user.role !== "admin"){
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }
        next();

    }catch(e){
        res.status(500).json({
            message:"error in the file",
        })
    }
};
module.exports = {isAdmin, verifyToken};