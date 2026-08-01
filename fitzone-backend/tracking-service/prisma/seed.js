const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rastgele tamsayı üreten yardımcı fonksiyon
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Rastgele ondalıklı sayı üreten yardımcı fonksiyon (sadece tam sayı için değiştirildi)
function getRandomFloat(min, max, decimals = 1) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

// Rastgele bir tarih üreten yardımcı fonksiyon
function getRandomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomDate = new Date(start + Math.random() * (end - start));
  return randomDate;
}

async function main() {
  console.log(`Seeding database...`);

  // Kullanıcı ID'leri (örnek olarak 5 kullanıcı ekliyoruz)
  const userIds = [1, 2, 3, 4, 5]; // Kullanıcı ID'lerini istediğiniz kadar arttırabilirsiniz
  // Oluşturulacak kayıt sayısı
  const numberOfRecords = 200;

  // 3 aylık tarih aralığı (Ocak - Mart)
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-03-31');

  // --- Egzersiz Geçmişi Verisi Oluşturma ---
  const exerciseNames = ['Push-up', 'Squat', 'Pull-up', 'Lunge', 'Plank', 'Deadlift', 'Bench Press', 'Overhead Press', 'Running', 'Cycling', 'Swimming'];
  const exerciseHistoryData = [];

  for (let i = 0; i < numberOfRecords; i++) {
    const userId = userIds[getRandomInt(0, userIds.length - 1)];  // Rastgele kullanıcı seçimi
    const date = getRandomDate(startDate, endDate);  // Rastgele tarih oluştur
    exerciseHistoryData.push({
      userId: userId,
      exercise: exerciseNames[getRandomInt(0, exerciseNames.length - 1)],
      sets: getRandomInt(2, 6), // 2 ile 6 set arası
      reps: getRandomInt(5, 25), // 5 ile 25 tekrar arası
      date: date, // Rastgele tarih
    });
  }

  // Toplu olarak Egzersiz Geçmişi ekleme
  await prisma.exerciseHistory.createMany({
    data: exerciseHistoryData,
    skipDuplicates: true, // İsteğe bağlı: Benzersiz kısıtlamalarda hatayı önler
  });
  console.log(`${numberOfRecords} adet Exercise History kaydı eklendi.`);

  // --- Beslenme Geçmişi Verisi Oluşturma ---
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout', 'Pre-Workout'];
  const nutritionHistoryData = [];

  for (let i = 0; i < numberOfRecords; i++) {
    const userId = userIds[getRandomInt(0, userIds.length - 1)];  // Rastgele kullanıcı seçimi
    const date = getRandomDate(startDate, endDate);  // Rastgele tarih oluştur
    nutritionHistoryData.push({
      userId: userId,
      mealType: mealTypes[getRandomInt(0, mealTypes.length - 1)],
      calories: getRandomInt(150, 1200), // 150 ile 1200 kalori arası
      protein: Math.round(getRandomFloat(5, 70, 1)),  // 5.0 ile 70.0 gr protein arası (int'e yuvarlandı)
      carbs: Math.round(getRandomFloat(10, 150, 1)), // 10.0 ile 150.0 gr karbonhidrat arası (int'e yuvarlandı)
      fat: Math.round(getRandomFloat(2, 60, 1)),    // 2.0 ile 60.0 gr yağ arası (int'e yuvarlandı)
      date: date, // Rastgele tarih
    });
  }

  // Toplu olarak Beslenme Geçmişi ekleme
  await prisma.nutritionHistory.createMany({
    data: nutritionHistoryData,
    skipDuplicates: true, // İsteğe bağlı
  });
  console.log(`${numberOfRecords} adet Nutrition History kaydı eklendi.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Seeding sırasında bir hata oluştu:');
    console.error(e);
    process.exit(1); // Hata durumunda script'i sonlandır
  })
  .finally(async () => {
    // Prisma Client bağlantısını kapat
    await prisma.$disconnect();
    console.log('Prisma Client bağlantısı kapatıldı.');
  });
