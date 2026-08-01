const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const exercises = [
  {
    name: "Burpee",
    category: "Full Body",
    videoUrl: "https://cdn.example.com/videos/burpee.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Squat",
    category: "Legs",
    videoUrl: "https://cdn.example.com/videos/squat.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Push-up",
    category: "Chest",
    videoUrl: "https://cdn.example.com/videos/pushup.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Lunge",
    category: "Legs",
    videoUrl: "https://cdn.example.com/videos/lunge.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Plank",
    category: "Core",
    videoUrl: "https://cdn.example.com/videos/plank.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Deadlift",
    category: "Back",
    videoUrl: "https://cdn.example.com/videos/deadlift.mp4",
    equipmentRequired: true,
    level: "Advanced", // Yeni level ekliyoruz
  },
  {
    name: "Bench Press",
    category: "Chest",
    videoUrl: "https://cdn.example.com/videos/bench_press.mp4",
    equipmentRequired: true,
    level: "Advanced", // Yeni level ekliyoruz
  },
  {
    name: "Biceps Curl",
    category: "Arms",
    videoUrl: "https://cdn.example.com/videos/bicep_curl.mp4",
    equipmentRequired: true,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Triceps Dips",
    category: "Arms",
    videoUrl: "https://cdn.example.com/videos/tricep_dips.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Mountain Climbers",
    category: "Full Body",
    videoUrl: "https://cdn.example.com/videos/mountain_climbers.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Russian Twists",
    category: "Core",
    videoUrl: "https://cdn.example.com/videos/russian_twists.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Jumping Jacks",
    category: "Cardio",
    videoUrl: "https://cdn.example.com/videos/jumping_jacks.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Shoulder Press",
    category: "Shoulders",
    videoUrl: "https://cdn.example.com/videos/shoulder_press.mp4",
    equipmentRequired: true,
    level: "Advanced", // Yeni level ekliyoruz
  },
  {
    name: "Leg Press",
    category: "Legs",
    videoUrl: "https://cdn.example.com/videos/leg_press.mp4",
    equipmentRequired: true,
    level: "Advanced", // Yeni level ekliyoruz
  },
  {
    name: "Crunches",
    category: "Core",
    videoUrl: "https://cdn.example.com/videos/crunches.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Calf Raises",
    category: "Legs",
    videoUrl: "https://cdn.example.com/videos/calf_raises.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Pull-up",
    category: "Back",
    videoUrl: "https://cdn.example.com/videos/pullup.mp4",
    equipmentRequired: true,
    level: "Advanced", // Yeni level ekliyoruz
  },
  {
    name: "High Knees",
    category: "Cardio",
    videoUrl: "https://cdn.example.com/videos/high_knees.mp4",
    equipmentRequired: false,
    level: "Beginner", // Yeni level ekliyoruz
  },
  {
    name: "Side Plank",
    category: "Core",
    videoUrl: "https://cdn.example.com/videos/side_plank.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
  {
    name: "Jump Squats",
    category: "Legs",
    videoUrl: "https://cdn.example.com/videos/jump_squats.mp4",
    equipmentRequired: false,
    level: "Intermediate", // Yeni level ekliyoruz
  },
];

async function main() {
  await prisma.exercise.deleteMany(); // Var olanları siler (isteğe bağlı)
  await prisma.exercise.createMany({ data: exercises });
  console.log("Egzersizler başarıyla seed edildi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
