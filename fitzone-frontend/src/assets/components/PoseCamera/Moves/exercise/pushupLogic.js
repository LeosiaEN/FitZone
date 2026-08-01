// src/exerciseLogics/pushupLogic.js

import {
  calculateAngle,
  smoothValue,
  calculateAngleDepthPercentage,
  findPoint,
} from "../../../../utils/poseUtils"; // Utility fonksiyonlarının yolunu kontrol edin


// Pushup için gerekli keypoint isimleri
const REQUIRED_POINTS = [
  "left_shoulder", "left_elbow", "left_wrist",
  "right_shoulder", "right_elbow", "right_wrist",
];

// Pushup için varsayılan sabit eşik değerleri (Ayarlama gerekebilir!)
// Dirsek açısı aşağıdayken küçük, yukarıdayken büyük
// Not: provided logs used 70 and 150, but code defaults are 120 and 170.
// The angleThreshold from config overrides DEFAULT_UP_THRESHOLD.
const DEFAULT_DOWN_THRESHOLD = 120; // Elbow angle is smaller when down
const DEFAULT_UP_THRESHOLD = 170; // Elbow angle is larger when up

// Yumuşatma geçmişi uzunluğu
const SMOOTHING_HISTORY_LENGTH = 7;


/**
 * Pushup hareketi için sayma ve derinlik mantığını işler.
 * Debug logları bu versiyonda kaldırılmıştır.
 * @param {Array<Object>} keypoints - Pose algılama kütüphanesinden gelen tüm keypoint'ler listesi.
 * @param {Object} currentState - useMotionCounter hook'unun mevcut state'leri ({ movementPhase, movementDepth, plankDuration, lastRepTime, plankStartTimeRef }).
 * @param {Object} config - useMotionCounter hook'undan gelen yapılandırma ({ minScore, angleThreshold, cooldownDuration }). angleThreshold burada UP_THRESHOLD'u ezmek için kullanılabilir.
 * @param {Object} historyRef - useMotionCounter hook'undan gelen, hareket geçmişini tutan useRef objesi.
 * @returns {Object} Ana hook'un state'lerini güncellemek için öneriler içeren obje ({ nextPhase, repIncreased, newDepth, error }).
 */
export const checkPushupLogic = (keypoints, currentState, config, historyRef) => {
  const { minScore = 0.4, angleThreshold } = config;
  const { movementPhase } = currentState;

  // Gerekli noktaları bul ve güvenilirlik skorlarını kontrol et
  const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));
  const allPointsValid = points.every(p => p && p.score >= minScore);

  // Noktalar eksikse veya güvenilir değilse erken çık
  if (!allPointsValid) {
    return {
     nextPhase: "initial",
     repIncreased: false,
     newDepth: 0,
     error: "Keypoints missing or confidence too low",
    };
  }

  // Gerekli keypoint'leri daha anlamlı isimlerle al
  const [lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist] = points;

  // Her iki kol için dirsek açısını hesapla (Omuz-Dirsek-Bilek)
  const leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
  const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);

  // Hesaplanan açılardan biri veya ikisi NaN ise erken çık
  if (isNaN(leftAngle) || isNaN(rightAngle)) {
    return {
     nextPhase: movementPhase,
     repIncreased: false,
     newDepth: 0,
     error: "One or both arm angles are NaN",
    };
  }

  // İki dirsek açısından ortalama olanı al ve yumuşat
  const avgAngle = (leftAngle + rightAngle) / 2;
  const smoothedAngle = smoothValue("pushup_avg_angle", avgAngle, historyRef, SMOOTHING_HISTORY_LENGTH);

  // Yumuşatılmış açı NaN ise erken çık
  if (isNaN(smoothedAngle)) {
    return {
     nextPhase: movementPhase,
     repIncreased: false,
     newDepth: 0,
     error: "Smoothed angle is NaN",
    };
  }

  // Hareket eşiklerini belirle
  const downThreshold = DEFAULT_DOWN_THRESHOLD;
  const upThreshold = angleThreshold !== undefined ? angleThreshold : DEFAULT_UP_THRESHOLD;

  // Derinlik yüzde hesabı
  const newDepth = calculateAngleDepthPercentage(smoothedAngle, downThreshold, upThreshold);

  let nextPhase = movementPhase;
  let repIncreased = false;

  // Faz geçiş mantığı
  if (movementPhase === "initial" || movementPhase === "up") {
    if (smoothedAngle < downThreshold) {
      nextPhase = "down";
    }
  } else if (movementPhase === "down") {
    if (smoothedAngle > upThreshold) {
      repIncreased = true; // Ana hook'a rep sayması için sinyal ver
      nextPhase = "up"; // Fazı "up" olarak güncelle
    }
  }

  // Ana hook'un state'lerini güncellemek için önerileri döndür
  return {
    nextPhase,
    repIncreased,
    newDepth,
    error: null,
  };
};