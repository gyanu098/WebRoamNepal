const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./dataBase/db");
const userRoutes = require("./route/userRoute");
const placeRoute = require("./route/placeRoute");
const reviewRoute = require("./route/reviewRoute");
const favoriteRoute = require("./route/favoriteRoute");
const feedbackRoute = require("./route/feedbackRoute");
const notificationRoute = require("./route/notificationRoute");
const messageRoute = require("./route/messageRoute");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Register routes with clear prefixes
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/favorites", favoriteRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/messages", messageRoute);



const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  console.log("Server is running");
  res.send("The backend is running");
});

app.get("/db-config", async (req, res) => {
  const result = await pool.query("SELECT * FROM students");
  res.json(result.rows);
});

// For running npm run dev
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// For executing case test
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
