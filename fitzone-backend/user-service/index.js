require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5002;

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
  res.json({ status: "UP", service: "User Service" });
});

app.use("/api/users", userRoutes);

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

app.listen(PORT, () => console.log(`🚀 User service running on port ${PORT}`));
