// src/exerciseLogics/deadliftLogic.js

import { calculateAngle, smoothValue, calculateAngleDepthPercentage, findPoint } from '../../../../utils/poseUtils';

// Deadlift için gerçekten ihtiyaç duyulan keypoint isimleri güncellendi
const REQUIRED_POINTS = [
    "left_hip", "left_knee",
    "right_hip", "right_knee",
    "left_shoulder", "right_shoulder", // Kalça açısı için omuzlar da gerekli
    // Ayak bileği noktaları (left_ankle, right_ankle) şu anki mantıkta kullanılmadığı için çıkarıldı.
    // Eğer ayak pozisyonu kontrolü eklemek isterseniz tekrar ekleyebilirsiniz.
];

// Deadlift için sabit eşik değerleri (derece)
const DOWN_THRESHOLD = 100; // Kalça açısı aşağıdayken küçük (gövde yere paralel/yakın)
const UP_THRESHOLD = 165; // Kalça açısı yukarıdayken büyük (gövde dik)


/**
 * Deadlift hareketi için sayma ve derinlik mantığını işler.
 * @param {Array<Object>} keypoints - Tüm algılanan keypoint'ler.
 * @param {Object} currentState - Mevcut hareket state'leri ({ movementPhase }).
 * @param {Object} config - Yapılandırma (örn: minScore, angleThreshold).
 * @param {Object} historyRef - Yumuşatma geçmişi için useRef objesi.
 * @returns {Object} Yapılması gereken state güncellemelerini içeren obje ({ nextPhase, repIncreased, newDepth, error }).
 */
export const checkDeadliftLogic = (keypoints, currentState, config, historyRef) => {
    const { minScore, angleThreshold } = config;
    const { movementPhase } = currentState;

    // Sadece REQUIRED_POINTS listesindeki noktaları bul ve confidence kontrolü yap
    const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));
    const allPointsFoundAndConfident = points.every(p => p && p.score >= minScore);

    if (!allPointsFoundAndConfident) {
         // console.warn("Deadlift keypoints missing or low confidence.");
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: "Low confidence" };
    }

    // İhtiyaç duyulan keypointleri destructuring ile al (ayak bilekleri artık burada değil)
    const [leftHip, leftKnee, rightHip, rightKnee, leftShoulder, rightShoulder] = points;


    // Kalça açısı (Omuz-Kalça-Diz) - Gövde ile bacak arasındaki ilişkiyi gösterir
    const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

    if (isNaN(leftHipAngle) || isNaN(rightHipAngle)) {
         // console.warn("Deadlift angle calculation returned NaN.");
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Angle NaN" };
    }

    const minHipAngle = Math.min(leftHipAngle, rightHipAngle); // İki kalçadan daha kapalı olanı al
    const smoothedMinHipAngle = smoothValue('deadlift_hip_angle', minHipAngle, historyRef, 7); // Smooth length ayarlanabilir

    if (isNaN(smoothedMinHipAngle)) {
         // console.warn("Deadlift smoothed angle is NaN.");
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Smoothed Angle NaN" };
    }

    // Derinlik yüzdesini hesapla
    const downThreshold = DOWN_THRESHOLD;
    const upThreshold = angleThreshold || UP_THRESHOLD; // Prop'tan gelen angleThreshold öncelikli

    // Kalça açısı ne kadar küçükse (aşağı pozisyon), derinlik o kadar fazladır
    const newDepth = calculateAngleDepthPercentage(smoothedMinHipAngle, downThreshold, upThreshold);


    let nextPhase = movementPhase;
    let repIncreased = false;

    // Faz geçiş mantığı: up -> down -> up bir tam rep sayılır
    if (movementPhase === "initial" || movementPhase === "up") {
        if (smoothedMinHipAngle < downThreshold) {
            nextPhase = "down";
        }
    } else if (movementPhase === "down") {
        if (smoothedMinHipAngle > upThreshold) {
             repIncreased = true; // Rep artışı sinyalini ver
            nextPhase = "up"; // Fazı her zaman güncelle
        }
    }

    return { nextPhase, repIncreased, newDepth, error: null };
};