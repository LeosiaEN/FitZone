// src/exerciseLogics/jumpingJackLogic.js

import { smoothValue, calculateDistanceDepthPercentage, findPoint } from '../../../../utils/poseUtils';
// calculateAngle fonksiyonu eğer bilek/omuz açısı kullanılacaksa import edilmeli,
// şu anki mantıkta sadece Y pozisyonu farkı yeterli.

const REQUIRED_POINTS = [
    "left_shoulder", "right_shoulder",
    "left_ankle", "right_ankle",
    "left_wrist", "right_wrist",
];

// Jumping Jack için sabit eşik değerleri (piksel veya normalize edilmiş birimler)
const CONTRACTED_DISTANCE_THRESHOLD = 70; // Ayaklar kapalıyken X mesafesi
const EXPANDED_DISTANCE_THRESHOLD = 150;  // Ayaklar açıkken X mesafesi


/**
 * Jumping Jack hareketi için sayma ve derinlik/genişleme mantığını işler.
 * @param {Array<Object>} keypoints - Tüm algılanan keypoint'ler.
 * @param {Object} currentState - Mevcut hareket state'leri ({ movementPhase }). // lastRepTime kaldırıldı
 * @param {Object} config - Yapılandırma (örn: minScore). // cooldownDuration kaldırıldı
 * @param {Object} historyRef - Yumuşatma geçmişi için useRef objesi.
 * @returns {Object} Yapılması gereken state güncellemelerini içeren obje ({ nextPhase, repIncreased, newDepth, error }).
 */
export const checkJumpingJackLogic = (keypoints, currentState, config, historyRef) => {
    const { minScore } = config;
    const { movementPhase } = currentState;
    console.log("Jumping Jack Logic: ", movementPhase);

    const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));
    const allPointsFoundAndConfident = points.every(p => p && p.score >= minScore);

    if (!allPointsFoundAndConfident) {
        return { nextPhase: 'Bekleme', repIncreased: false, newDepth: 0, error: "Low confidence" };
    }

    const [leftShoulder, rightShoulder, leftAnkle, rightAnkle, leftWrist, rightWrist] = points;

    // Ayak bileği X mesafesi
    const ankleDist = Math.abs(leftAnkle.x - rightAnkle.x);

    // Bileklerin omuz hizasından yukarıda olup olmadığını kontrol et (Y koordinatı ekranda yukarı doğru azalır)
    // Omuzların ortalama Y pozisyonu referans alınabilir
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;

    const wristsAreUp = avgWristY < avgShoulderY; // Bilekler omuzların üstündeyse true


    // Mesafeyi yumuşat
    const smoothedAnkleDist = smoothValue('jj_distance', ankleDist, historyRef, 5); // Smooth length ayarlanabilir

    if (isNaN(smoothedAnkleDist)) {
        return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Smoothed Distance NaN" };
    }

    // Derinlik/Genişleme yüzdesini hesapla (mesafe bazlı)
    const contractedThreshold = CONTRACTED_DISTANCE_THRESHOLD;
    const expandedThreshold = EXPANDED_DISTANCE_THRESHOLD;

    // Yüzde hesaplama, mesafe arttıkça artar.
    const newDepth = calculateDistanceDepthPercentage(smoothedAnkleDist, contractedThreshold, expandedThreshold);


    // Kontraksiyon durumu: ayaklar yakın VE bilekler aşağıda (veya en azından yukarıda değil)
    const isContracted = smoothedAnkleDist < contractedThreshold && !wristsAreUp;
    // Genişleme durumu: ayaklar uzak VE bilekler yukarıda
    const isExpanded = smoothedAnkleDist > expandedThreshold && wristsAreUp;


    let nextPhase = movementPhase;
    let repIncreased = false;

     // Faz geçiş mantığı: contracted -> expanded -> contracted bir tam rep sayılır
    if (movementPhase === "Bekleme" || movementPhase === "contracted") {
        if (isExpanded) {
            nextPhase = "expanded";
        }
    } else if (movementPhase === "expanded") {
        if (isContracted) {
             repIncreased = true; // Rep artışı sinyalini ver
             nextPhase = "contracted"; // Fazı her zaman güncelle
        }
    }

    // JJ'de derinlik "genişleme" yi ifade eder.
    return { nextPhase, repIncreased, newDepth, error: null };
};