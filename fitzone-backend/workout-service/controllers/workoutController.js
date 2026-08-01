const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Kullanıcının kendi workoutlarını getirir
const getMyWorkouts = async (req, res) => {
  const userId = req.user.userId; // userId'yi req.user.userId'den alıyoruz
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
    res.json(workouts);
  } catch (err) {
    console.error("Workouts alınırken hata:", err);
    res.status(500).json({ error: "Workouts alınamadı" });
  }
};

const createWorkout = async (req, res) => {
  console.log("User ID Create:", req.user);  // Bu log'u ekliyoruz
  const userIds = req.user.userId;
  const userId = Number(userIds);
    console.log("UserId CreateWorkout :",userId)

  if (!userId) {
      console.error("User ID missing in the request:", req.user);
      return res.status(400).json({ message: 'User ID is missing' });
  }

  const { title, description, duration, level, isPublic, exercises } = req.body;

  try {
      const workout = await prisma.workout.create({
          data: {
              title,
              description,
              duration,
              level,
              isPublic,
              userId, // userId'yi burada kullanıyoruz
              exercises: {
                  create: exercises.map((ex) => ({
                      exercise: {
                          connect: { id: ex.exerciseId },
                      },
                      sets: ex.sets ?? 3,
                      reps: ex.reps ?? 12,
                  })),
              },
          },
          include: {
              exercises: {
                  include: {
                      exercise: true,
                  },
              },
          },
      });

      return res.status(201).json(workout);
  } catch (error) {
      console.error('Error creating workout:', error);
      return res.status(500).json({ message: 'Error creating workout' });
  }
};



// Var olan workout'u günceller
const updateWorkout = async (req, res) => {
  const { id } = req.params;
  const { title, description, duration, level, isPublic, exercises } = req.body;

  try {
    // İlgili workout'u güncelle
    const updatedWorkout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        duration,
        level,
        isPublic,
      },
    });

    // Eski egzersiz bağlantılarını sil
    await prisma.workoutExercise.deleteMany({
      where: { workoutId: parseInt(id) },
    });

    // Yeni egzersizleri oluştur
    await prisma.workoutExercise.createMany({
      data: exercises.map((ex) => ({
        workoutId: parseInt(id),
        exerciseId: ex.exerciseId,
        sets: ex.sets ?? 3, // Varsayılan set sayısı
        reps: ex.reps ?? 12, // Varsayılan rep sayısı
      })),
    });

    const updated = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Workout güncellenirken hata:", err);
    res.status(500).json({ error: "Workout güncellenemedi" });
  }
};

// Workout'u siler
const deleteWorkout = async (req, res) => {
  const { id } = req.params;

  try {
    // İlgili workout ve egzersiz bağlantılarını sil
    await prisma.workoutExercise.deleteMany({ where: { workoutId: parseInt(id) } });

    // Workout kaydını sil
    await prisma.workout.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Workout başarıyla silindi" });
  } catch (err) {
    console.error("Workout silinirken hata:", err);
    res.status(500).json({ error: "Workout silinemedi" });
  }
};

// Herkesin görebileceği workout'ları listeler
const getPublicWorkouts = async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { isPublic: true },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
    res.json(workouts);
  } catch (err) {
    console.error("Public workoutlar çekilirken hata:", err);
    res.status(500).json({ error: "Public workoutlar alınamadı" });
  }
};

// workoutId'ye göre workout'ı getirir
const getWorkoutById = async (req, res) => {
  console.log("workoutid backend",req.params.id);
  const workoutId  = req.params.id;  // URL'den workout ID'yi alıyoruz
  const userId = req.user.userId;  // JWT'den userId'yi alıyoruz

  try {
    const workoutIdInt = Number(workoutId); // Number ile de dönüşüm yapabilirsiniz.


    if (isNaN(workoutIdInt)) {
      return res.status(400).json({ error: "Geçersiz workout ID" });
    }

    // Workout'ı ID'ye göre buluyoruz
    const workout = await prisma.workout.findUnique({
      where: {
        id: workoutIdInt,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    // Workout bulunmadıysa veya kullanıcıya ait değilse
    if (!workout || (workout.userId !== userId && !workout.isPublic)) {
      return res.status(403).json({ error: "Erişim izniniz yok veya workout bulunamadı" });
    }

    // Eğer workout bulunmuşsa ve kullanıcıya aitse veya publicse, döndürüyoruz
    return res.json(workout);

  } catch (err) {
    console.error("Workout alınırken hata:", err);
    res.status(500).json({ error: "Workout alınamadı" });
  }
};

module.exports = {
  getMyWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getPublicWorkouts,
  getWorkoutById,
};
