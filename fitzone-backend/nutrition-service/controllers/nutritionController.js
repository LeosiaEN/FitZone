const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Tüm öğünleri ve içindeki yiyecekleri getirir
const getMyMeals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planName } = req.query;

    const meals = await prisma.nutritionLog.findMany({
      where: {
        userId,
        ...(planName && { planName }), // Eğer filtre varsa uygula
      },
      include: {
        entries: {
          include: {
            foodItem: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};

// Yeni bir öğün oluşturur (birden çok yiyecek içerebilir)
const createMeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mealType, date, planName, items } = req.body;

    const meal = await prisma.nutritionLog.create({
      data: {
        userId,
        mealType,
        planName,
        date: date ? new Date(date) : undefined,
        entries: {
          create: items.map((item) => ({
            foodItemId: item.foodItemId,
            amountInGrams: item.amountInGrams,
          })),
        },
      },
      include: {
        entries: { include: { foodItem: true } },
      },
    });

    res.status(201).json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create meal" });
  }
};

// Öğünü günceller (yalnızca mealType, date ve planName gibi üst bilgileri)
const updateMeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { mealType, date, planName } = req.body;

    const meal = await prisma.nutritionLog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!meal || meal.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or meal not found" });
    }

    const updated = await prisma.nutritionLog.update({
      where: { id: parseInt(id) },
      data: {
        mealType,
        planName,
        date: date ? new Date(date) : undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update meal" });
  }
};

// Tüm yiyecekleri getirir (örneğin kullanıcı seçim için görsün)
const getAllFoodItems = async (req, res) => {
  try {
    const items = await prisma.foodItem.findMany({
      orderBy: { name: "asc" },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch food items" });
  }
};

// Öğünü ve içindeki yemekleri siler
const deleteMeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const meal = await prisma.nutritionLog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!meal || meal.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or meal not found" });
    }

    await prisma.nutritionLog.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete meal" });
  }
};

module.exports = {
  getMyMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  getAllFoodItems,
};
