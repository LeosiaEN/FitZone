require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nutritionRoutes = require("./routes/nutritionRoutes");

const app = express();
const PORT = process.env.PORT || 5004;

// ==============================================================================
// MIDDLEWARE CONFIGURATION
// ==============================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// ==============================================================================
// ROUTES & HEALTH CHECK
// ==============================================================================

app.get("/api", (req, res) => {
  res.json({ status: "UP", service: "Nutrition Service" });
});

app.use("/api/nutrition", nutritionRoutes);

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

app.listen(PORT, () => console.log(`🚀 Nutrition service running on port ${PORT}`));
