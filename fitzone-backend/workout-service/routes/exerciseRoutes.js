const express = require("express");
const router = express.Router();
const { getAllExercises } = require("../controllers/exerciseController");
const authenticateToken = require("../middleware/authMiddleware");

// Token doğrulaması eklenmiş
router.get("/", authenticateToken, getAllExercises); 

module.exports = router;
