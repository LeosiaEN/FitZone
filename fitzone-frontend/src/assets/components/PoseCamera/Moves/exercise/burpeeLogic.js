// src/exerciseLogics/burpeeLogic.js

// Removed getDistance as it was not used
import { calculateAngle, smoothValue, findPoint } from '../../../../utils/poseUtils'; // poseUtils dosyanızın doğru yolu

// Burpee için gerekli keypoint isimleri
const REQUIRED_POINTS = [
    "left_shoulder", "right_shoulder",
    "left_elbow", "right_elbow", // Still listing elbows as they might be useful later, but not destructuring if unused
    "left_wrist", "right_wrist",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
];

// Burpee için eşik değerleri (bu değerler test edilerek ayarlanmalıdır)
const PLANK_HIP_THRESHOLD = 0.2; // Kalçanın omuzlara göre dikey konumu (0'a yakın plank, 1'e yakın ayakta)
const SQUAT_KNEE_ANGLE_THRESHOLD = 140; // Squat pozisyonunda diz açısı eşiği
const STANDING_HIP_THRESHOLD = 0.6; // Ayakta durma pozisyonunda kalçanın omuzlara göre dikey konumu
const JUMP_THRESHOLD = 20; // Zıplama algılama için ayak bileği dikey hareket eşiği (piksel cinsinden, ayarlanmalı)

/**
 * Burpee hareketi için sayma ve faz mantığını işler.
 * @param {Array<Object>} keypoints - Tüm algılanan keypoint'ler.
 * @param {Object} currentState - Mevcut hareket state'leri ({ movementPhase, lastRepTime }).
 * @param {Object} config - Yapılandırma (örn: minScore, cooldownDuration).
 * @param {Object} historyRef - Yumuşatma geçmişi ve önceki frame verileri için useRef objesi.
 * @returns {Object} Yapılması gereken state güncellemelerini içeren obje ({ nextPhase, repIncreased, newDepth, error }).
 */
export const checkBurpeeLogic = (keypoints, currentState, config, historyRef) => {
    const { minScore, cooldownDuration } = config;
    const { movementPhase, lastRepTime } = currentState;

    // Gerekli noktaları bul
    // Note: We find all required points, but only destructure the ones currently used
    const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));

    // Noktaların hepsinin bulunup minScore üzerinde olduğunu kontrol et
    const allPointsFoundAndConfident = points.every(p => p && p.score >= minScore);

    if (!allPointsFoundAndConfident) {
        // Keypoint eksikse veya güven düşükse fazı initial yap
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: "Low confidence" };
    }

    // Destructure only the points currently used in the logic
    const [
        leftShoulder, rightShoulder,
        // leftElbow, rightElbow, // Removed from destructuring as they are not used yet
        leftWrist, rightWrist,
        leftHip, rightHip,
        leftKnee, rightKnee,
        leftAnkle, rightAnkle
    ] = [
        findPoint(keypoints, "left_shoulder"), findPoint(keypoints, "right_shoulder"),
        findPoint(keypoints, "left_wrist"), findPoint(keypoints, "right_wrist"),
        findPoint(keypoints, "left_hip"), findPoint(keypoints, "right_hip"),
        findPoint(keypoints, "left_knee"), findPoint(keypoints, "right_knee"),
        findPoint(keypoints, "left_ankle"), findPoint(keypoints, "right_ankle"),
    ];


    // Ortalama vücut noktalarını hesapla (sol ve sağın ortalaması)
    const centerHipY = (leftHip.y + rightHip.y) / 2;
    const centerShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    // const centerKneeY = (leftKnee.y + rightKnee.y) / 2; // Not used in current logic
    const centerAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
    const centerWristY = (leftWrist.y + rightWrist.y) / 2;

    // Kalçanın omuzlara göre dikey konumu (0 = omuzlarla aynı hizada veya altında, 1 = omuzların çok üstünde)
    // Bu değer ayakta dururken 1'e yakın, plank pozisyonunda 0'a yakın olacaktır.
    const hipShoulderRatio = (centerHipY - centerShoulderY) / (centerAnkleY - centerShoulderY + 1e-6); // Paydada sıfıra bölme hatasını önlemek için küçük bir değer ekledik

    // Diz açıları
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const minKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);

    // Ayak bileklerinin dikey konumu (zıplamayı algılamak için)
    const prevAnkleY = historyRef.current.prevAnkleY || centerAnkleY;
    const ankleDeltaY = Math.abs(centerAnkleY - prevAnkleY);
    historyRef.current.prevAnkleY = centerAnkleY; // Bir sonraki frame için kaydet

    // Açı ve oranları yumuşat
    const smoothedHipShoulderRatio = smoothValue('burpee_hip_shoulder', hipShoulderRatio, historyRef, 5);
    const smoothedMinKneeAngle = smoothValue('burpee_knee_angle', minKneeAngle, historyRef, 5);
    const smoothedAnkleDeltaY = smoothValue('burpee_ankle_delta', ankleDeltaY, historyRef, 5);


    let nextPhase = movementPhase;
    let repIncreased = false;
    let newDepth = 0; // Burpee için derinlik yüzdesi daha karmaşık olabilir, şimdilik 0 tutalım

    // Faz geçiş mantığı
    switch (movementPhase) {
        case 'initial': // Ayakta durma veya başlangıç pozisyonu
            // Plank pozisyonuna geçiş: Kalça yeterince aşağıda ve bilekler omuzların altında/önünde
            if (smoothedHipShoulderRatio < PLANK_HIP_THRESHOLD && centerWristY < centerShoulderY) {
                nextPhase = 'plank_position';
                console.log("Burpee: Phase Transition -> PLANK");
            }
            break;

        case 'plank_position': { // Added block here to wrap declarations
            // Squat pozisyonuna geçiş: Dizler bükülmüş (ayaklar öne gelmiş)
            // Note: We check against the original points here as we need their specific Y coordinates
            const currentLeftHip = findPoint(keypoints, "left_hip");
            const currentRightHip = findPoint(keypoints, "right_hip");
            const currentLeftKnee = findPoint(keypoints, "left_knee");
            const currentRightKnee = findPoint(keypoints, "right_knee");

            if (currentLeftHip && currentRightHip && currentLeftKnee && currentRightKnee) {
                 const currentCenterHipY = (currentLeftHip.y + currentRightHip.y) / 2;
                 const currentCenterKneeY = (currentLeftKnee.y + currentRightKnee.y) / 2;

                 if (smoothedMinKneeAngle < SQUAT_KNEE_ANGLE_THRESHOLD && currentCenterHipY > currentCenterKneeY) { // Kalça dizden yukarıda olmalı
                      nextPhase = 'squat_position';
                      console.log("Burpee: Phase Transition -> SQUAT");
                 }
            }
            break;
        } // Closing block for the case

        case 'squat_position': // Ayaklar öne gelmiş, çömelme pozisyonu
            // Ayakta durma veya zıplama pozisyonuna geçiş: Vücut doğruluyor
            if (smoothedHipShoulderRatio > STANDING_HIP_THRESHOLD) {
                 // Zıplama var mı control et
                 if (smoothedAnkleDeltaY > JUMP_THRESHOLD) {
                     nextPhase = 'jump';
                     console.log("Burpee: Phase Transition -> JUMP");
                 } else {
                     // Zıplama yoksa direkt ayakta durma say ve rep'i artır
                     const now = Date.now();
                     if (now > lastRepTime + cooldownDuration) {
                         repIncreased = true;
                         console.log("Burpee: Rep Counted (No Jump)!");
                     } else {
                         console.log("Burpee: Rep Skipped due to Cooldown (No Jump).");
                     }
                     nextPhase = 'initial'; // Tekrar başlangıç pozisyonuna dön
                     console.log("Burpee: Phase Transition -> INITIAL (No Jump)");
                 }
            }
            break;

        case 'jump': // Zıplama aşaması
            // Ayakta durma pozisyonuna geri dönüş: Ayak bileği dikey hareketi azaldı
            if (smoothedAnkleDeltaY < JUMP_THRESHOLD * 0.5) { // Zıplama eşiğinin yarısı gibi bir değerle inişi algıla
                 const now = Date.now();
                 if (now > lastRepTime + cooldownDuration) {
                     repIncreased = true;
                     console.log("Burpee: Rep Counted (Jump)!");
                 } else {
                      console.log("Burpee: Rep Skipped due to Cooldown (Jump).");
                 }
                 nextPhase = 'initial'; // Tekrar başlangıç pozisyonuna dön
                 console.log("Burpee: Phase Transition -> INITIAL (After Jump)");
            }
            break;

        default:
            nextPhase = 'initial'; // Tanımsız bir fazdaysa başlangıca dön
            break;
    }

    // Yapılması gereken güncellemeleri döndür
    return { nextPhase, repIncreased, newDepth, error: null };
};
