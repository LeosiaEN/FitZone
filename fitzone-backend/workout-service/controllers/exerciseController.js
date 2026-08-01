// controllers/exerciseController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllExercises = async (req, res) => {
  const { category, equipmentRequired, name } = req.query;

  try {
    const filters = {};
    if (category) filters.category = category;
    if (equipmentRequired !== undefined) {
      filters.equipmentRequired = equipmentRequired === "true";
    }
    if (name) {
      filters.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    const exercises = await prisma.exercise.findMany({ where: filters });

    res.json(exercises);
  } catch (err) {
    console.error("Egzersizler alınırken hata:", err);
    res.status(500).json({ error: "Egzersizler alınamadı" });
  }
};

module.exports = { getAllExercises };
