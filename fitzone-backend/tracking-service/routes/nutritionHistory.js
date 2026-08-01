const express = require('express');
const { getNutritionHistory, addNutritionHistory } = require('../controllers/nutritionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/nutrition-history', authMiddleware, getNutritionHistory);
router.post('/nutrition-history', authMiddleware, addNutritionHistory);

module.exports = router;
