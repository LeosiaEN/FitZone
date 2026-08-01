// src/utils/poseUtils.js

import { calculateAngleRobust } from "./geometry"; // calculateAngleRobust'u doğru yoldan içe aktardığınızı varsayalım

/**
 * Keypoint listesi içinde belirli bir isme sahip keypoint'i bulur.
 * @param {Array<Object>} keypoints - Poz keypoint'leri listesi.
 * @param {string} name - Aranacak keypoint'in adı.
 * @returns {Object|undefined} Bulunan keypoint veya undefined.
 */
export const findPoint = (keypoints, name) =>
  keypoints?.find((k) => k.name === name); // Null/undefined keypoints kontrolü eklendi

/**
 * Üç keypoint arasındaki açıyı hesaplar.
 * @param {Object} p1 - İlk keypoint.
 * @param {Object} p2 - Orta (köşe) keypoint.
 * @param {Object} p3 - Üçüncü keypoint.
 * @returns {number} Hesaplanan açı (derece) veya NaN.
 */
export const calculateAngle = (p1, p2, p3) => {
  // Güvenlik kontrolü: Noktaların varlığını ve gerekli koordinatlara sahip olduğunu kontrol et
  if (!p1?.x || !p1?.y || !p2?.x || !p2?.y || !p3?.x || !p3?.y) {
      // console.warn("calculateAngle: Invalid point data received.", {p1, p2, p3}); // Debug için açılabilir
      return NaN;
  }
  return calculateAngleRobust(p1, p2, p3);
};


/**
 * Belirli bir değer için hareket geçmişini kullanarak yumuşatılmış değeri hesaplar.
 * @param {string} movementKey - Hareketi/ölçümü tanımlayan eşsiz anahtar (örn: 'squat_angle', 'jj_distance').
 * @param {number} currentValue - Mevcut ham değer (açı veya mesafe).
 * @param {Object} historyRef - useRef tarafından yönetilen geçmiş objesi.
 * @param {number} historyLength - Geçmişte tutulacak frame sayısı.
 * @returns {number} Yumuşatılmış değer veya NaN.
 */
export const smoothValue = (movementKey, currentValue, historyRef, historyLength = 5) => {
  if (!historyRef.current[movementKey]) {
    historyRef.current[movementKey] = [];
  }
  const history = historyRef.current[movementKey];

  // Geçerli sayısal değeri geçmişe ekle
  if (currentValue !== null && currentValue !== undefined && !isNaN(currentValue)) {
    history.push(currentValue);
    // Geçmiş uzunluğunu sınırla
    if (history.length > historyLength) {
      history.shift();
    }
  } else if (history.length > 0) {
      // Eğer mevcut değer geçersizse, son geçerli değeri kullanmaya devam et (isteğe bağlı)
      // Veya sadece yeni değer eklemeyip mevcut geçmişle devam et
      // Bu implementasyonda sadece geçerli değerler eklenir.
      // Geçersiz değer geldiğinde geçmişi temizlemiyoruz, sadece eklemiyoruz.
  }


  // Geçerli sayısal geçmiş değerlerini filtrele
  const validHistory = history.filter(
    (val) => typeof val === "number" && !isNaN(val)
  );

  // Geçmişte geçerli değer yoksa NaN döndür
  if (validHistory.length === 0) {
    return NaN;
  }

  // Ortalamayı hesapla
  const sum = validHistory.reduce((acc, val) => acc + val, 0);
  return sum / validHistory.length;
};


/**
 * Açıya dayalı bir hareketin derinlik yüzdesini hesaplar.
 * Açı küçüldükçe derinlik artar (örn: squat, pushup, lunge, deadlift).
 * @param {number} currentAngle - Mevcut açı.
 * @param {number} minAngleThreshold - Tam derinliğe (%100) karşılık gelen minimum açı eşiği.
 * @param {number} maxAngleThreshold - Başlangıca (%0) karşılık gelen maksimum açı eşiği.
 * @returns {number} 0 ile 100 arasında derinlik yüzdesi.
 */
export const calculateAngleDepthPercentage = (currentAngle, minAngleThreshold, maxAngleThreshold) => {
    if (maxAngleThreshold === minAngleThreshold) return 0; // Avoid division by zero

    // Açıyı eşikler arasına sıkıştır
    const clampedAngle = Math.max(minAngleThreshold, Math.min(maxAngleThreshold, currentAngle));

    // Yüzde hesaplama: maxAngleThreshold'da 0%, minAngleThreshold'da 100%
    const depth = (maxAngleThreshold - clampedAngle) / (maxAngleThreshold - minAngleThreshold) * 100;

    return Math.max(0, Math.min(100, depth)); // Ensure result is between 0 and 100
};

/**
 * Mesafeye dayalı bir hareketin derinlik/genişleme yüzdesini hesaplar.
 * Mesafe arttıkça derinlik/genişleme artar (örn: jumping jack).
 * @param {number} currentDistance - Mevcut mesafe.
 * @param {number} minDistanceThreshold - Başlangıca (%0) karşılık gelen minimum mesafe eşiği.
 * @param {number} maxDistanceThreshold - Tam genişliğe (%100) karşılık gelen maksimum mesafe eşiği.
 * @returns {number} 0 ile 100 arasında derinlik/genişleme yüzdesi.
 */
export const calculateDistanceDepthPercentage = (currentDistance, minDistanceThreshold, maxDistanceThreshold) => {
    if (maxDistanceThreshold === minDistanceThreshold) return 0; // Avoid division by zero

     // Mesafeyi eşikler arasına sıkıştır
    const clampedDistance = Math.max(minDistanceThreshold, Math.min(maxDistanceThreshold, currentDistance));

    // Yüzde hesaplama: minDistanceThreshold'da 0%, maxDistanceThreshold'da 100%
    const depth = (clampedDistance - minDistanceThreshold) / (maxDistanceThreshold - minDistanceThreshold) * 100;

    return Math.max(0, Math.min(100, depth)); // Ensure result is between 0 and 100
};