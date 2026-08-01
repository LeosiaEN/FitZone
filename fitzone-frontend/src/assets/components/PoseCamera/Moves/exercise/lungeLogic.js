// src/exerciseLogics/lungeLogic.js

import { calculateAngle, smoothValue, calculateAngleDepthPercentage, findPoint } from '../../../../utils/poseUtils';

const REQUIRED_POINTS = [
    "left_hip", "left_knee", "left_ankle",
    "right_hip", "right_knee", "right_ankle",
];

// Lunge için sabit eşik değerleri (props ile esnetilebilir)
const DOWN_THRESHOLD = 100; // Diz açısı aşağıdayken küçük (örn: 100 derece)
const UP_THRESHOLD = 165; // Diz açısı yukarıdayken büyük (örn: 165 derece)


/**
 * Lunge hareketi için sayma ve derinlik mantığını işler.
 * @param {Array<Object>} keypoints - Tüm algılanan keypoint'ler.
 * @param {Object} currentState - Mevcut hareket state'leri ({ movementPhase }). // lastRepTime kaldırıldı
 * @param {Object} config - Yapılandırma (örn: minScore, angleThreshold). // cooldownDuration kaldırıldı
 * @param {Object} historyRef - Yumuşatma geçmişi için useRef objesi.
 * @returns {Object} Yapılması gereken state güncellemelerini içeren obje ({ nextPhase, repIncreased, newDepth, error }).
 */
export const checkLungeLogic = (keypoints, currentState, config, historyRef) => {
    const { minScore, angleThreshold } = config; // cooldownDuration kaldırıldı
    const { movementPhase } = currentState; // lastRepTime kaldırıldı

    const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));
    const allPointsFoundAndConfident = points.every(p => p && p.score >= minScore);

    if (!allPointsFoundAndConfident) {
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: "Low confidence" };
    }

    const [leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle] = points;

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    if (isNaN(leftKneeAngle) || isNaN(rightKneeAngle)) {
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Angle NaN" };
    }

    const minAngle = Math.min(leftKneeAngle, rightKneeAngle);
    const smoothedMinAngle = smoothValue('lunge_angle', minAngle, historyRef, 7);

    if (isNaN(smoothedMinAngle)) {
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Smoothed Angle NaN" };
    }

    const downThreshold = DOWN_THRESHOLD;
    const upThreshold = angleThreshold || UP_THRESHOLD;

    const newDepth = calculateAngleDepthPercentage(smoothedMinAngle, downThreshold, upThreshold);

    let nextPhase = movementPhase;
    let repIncreased = false;

    // Faz geçiş mantığı
    if (movementPhase === "initial" || movementPhase === "up") {
        if (smoothedMinAngle < downThreshold) {
            nextPhase = "down";
        }
    } else if (movementPhase === "down") {
        if (smoothedMinAngle > upThreshold) {
            repIncreased = true; // Sadece rep artışı sinyalini ver
            nextPhase = "up"; // Fazı her zaman güncelle
        }
    }

    return { nextPhase, repIncreased, newDepth, error: null };
};