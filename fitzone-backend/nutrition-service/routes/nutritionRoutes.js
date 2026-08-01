const express = require("express");
const router = express.Router();
const nutritionController = require("../controllers/nutritionController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/", verifyToken, nutritionController.getMyMeals); // kendi yemeklerini alır
router.post("/", verifyToken, nutritionController.createMeal); // yemek oluşturur
router.put("/:id", verifyToken, nutritionController.updateMeal); // yemek günceller
router.delete("/:id", verifyToken, nutritionController.deleteMeal); // yemek siler
router.get("/food-items", verifyToken, nutritionController.getAllFoodItems);


module.exports = router;
