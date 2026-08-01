require("dotenv").config();
const express = require("express");
const cors = require("cors");
const workoutRoutes = require("./routes/workoutRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");

const app = express();
const PORT = process.env.PORT || 5003;

// ==============================================================================
// MIDDLEWARE CONFIGURATION
// ==============================================================================

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ==============================================================================
// ROUTES & HEALTH CHECK
// ==============================================================================

app.get("/api", (req, res) => {
  res.json({ status: "UP", service: "Workout Service" });
});

app.use("/api/workouts", workoutRoutes);
app.use("/api/exercises", exerciseRoutes);

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

app.listen(PORT, () => console.log(`🚀 Workout service running on port ${PORT}`));
