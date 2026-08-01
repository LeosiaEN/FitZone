// src/exerciseLogics/squatLogic.js

import { calculateAngle, smoothValue, calculateAngleDepthPercentage, findPoint } from '../../../../utils/poseUtils';

// Squat için gerekli keypoint isimleri (İsterseniz MOVEMENT_KEYPOINTS'i de prop olarak alabilirsiniz)
const REQUIRED_POINTS = [
    "left_hip", "left_knee", "left_ankle",
    "right_hip", "right_knee", "right_ankle",
];

// Squat için sabit eşik değerleri (props ile esnetilebilir)
const DOWN_THRESHOLD = 110;
const UP_THRESHOLD = 170; // Bu değer props'tan gelmeli, şimdilik sabit tutalım

/**
 * Squat hareketi için sayma ve derinlik mantığını işler.
 * @param {Array<Object>} keypoints - Tüm algılanan keypoint'ler.
 * @param {Object} currentState - Mevcut hareket state'leri ({ movementPhase, movementDepth, lastRepTime }).
 * @param {Object} config - Yapılandırma (örn: minScore, angleThreshold, cooldownDuration).
 * @param {Object} historyRef - Yumuşatma geçmişi için useRef objesi.
 * @returns {Object} Yapılması gereken state güncellemelerini içeren obje ({ nextPhase, repIncreased, newDepth, error }).
 */
export const checkSquatLogic = (keypoints, currentState, config, historyRef) => {
    const { minScore, angleThreshold, cooldownDuration } = config;
    const { movementPhase, lastRepTime } = currentState; // Mevcut depth burada kullanılmıyor, ama alınabilir

    // Gerekli noktaları bul
    const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));

    // Noktaların hepsinin bulunup minScore üzerinde olduğunu kontrol et
    const allPointsFoundAndConfident = points.every(p => p && p.score >= minScore);

    if (!allPointsFoundAndConfident) {
        // Keypoint eksikse veya güven düşükse derinliği sıfırla ve fazı initial yap (ana hook'ta yapılacak)
         //console.warn("Squat keypoints missing or low confidence.");
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: "Low confidence" };
    }

    const [leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle] = points;

    // Açıları hesapla
    const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    if (isNaN(leftAngle) || isNaN(rightAngle)) {
         //console.warn("Squat angle calculation returned NaN.");
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Angle NaN" };
    }

    const minAngle = Math.min(leftAngle, rightAngle);

    // Açıyı yumuşat
    const smoothedMinAngle = smoothValue('squat_angle', minAngle, historyRef, 10);

    if (isNaN(smoothedMinAngle)) {
        // console.warn("Squat smoothed angle is NaN.");
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Smoothed Angle NaN" };
    }

    // Derinlik yüzdesini hesapla (prop'tan gelen angleThreshold'u kullan)
    const downThreshold = 110; // Sabit veya config'den gelebilir
    const upThreshold = angleThreshold; // Config'den gelen eşik

    const newDepth = calculateAngleDepthPercentage(smoothedMinAngle, downThreshold, upThreshold);

    let nextPhase = movementPhase;
    let repIncreased = false;

    // Faz geçiş mantığı
    if (movementPhase === "initial" || movementPhase === "up") {
        if (smoothedMinAngle < downThreshold) {
            nextPhase = "down";
             //console.log(`Squat: Phase Transition -> DOWN (Angle ${smoothedMinAngle.toFixed(1)} < ${downThreshold})`);
        }
    } else if (movementPhase === "down") {
        if (smoothedMinAngle > upThreshold) {
            const now = Date.now();
            if (now > lastRepTime + cooldownDuration) {
                repIncreased = true;
                 console.log("Squat: Rep Counted!");
            } else {
                 console.log("Squat: Rep Skipped due to Cooldown.");
            }
            nextPhase = "up"; // Fazı her zaman güncelle
             //console.log(`Squat: Potential Phase Transition -> UP (Angle ${smoothedMinAngle.toFixed(1)} > ${upThreshold})`);
        }
    }

    // Yapılması gereken güncellemeleri döndür
    return { nextPhase, repIncreased, newDepth, error: null };
};