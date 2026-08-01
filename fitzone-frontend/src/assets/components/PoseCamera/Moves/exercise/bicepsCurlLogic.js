// src/exerciseLogics/bicepCurlLogic.js

import {
      calculateAngle,
      smoothValue,
      findPoint,
      // Biceps Curl için derinlik hesaplaması genelde kullanılmaz, ama ihtiyacınız olursa import edilebilir:
      // calculateAngleDepthPercentage,
    } from '../../../../utils/poseUtils'; // Yardımcı fonksiyonların doğru yolu
    
    // Biceps Curl için gerekli keypoint isimleri
    const REQUIRED_POINTS = [
      "left_shoulder", "left_elbow", "left_wrist",
      "right_shoulder", "right_elbow", "right_wrist",
    ];
    
    // Biceps Curl için varsayılan eşik değerleri (Ayarlama gerekebilir!)
    // Biceps Curl'de dirsek açısı kol düzken büyük, bükülmüşken küçük olur.
    const DEFAULT_DOWN_THRESHOLD = 40; // Dirsek açısı kol bükülmüşken (aşağıdayken)
    const DEFAULT_UP_THRESHOLD = 160; // Dirsek açısı kol düzken (yukarıdayken)
    
    // Yumuşatma geçmişi uzunluğu
    const SMOOTHING_HISTORY_LENGTH = 5; // Farklı bir yumuşatma uzunluğu deneyebilirsiniz
    
    
    /**
    * Biceps Curl hareketi için sayma mantığını işler.
    * Debug logları bu versiyona eklenmiştir.
    * @param {Array<Object>} keypoints - Tüm algılanan keypoint'ler.
    * @param {Object} currentState - Mevcut hareket state'leri ({ movementPhase, lastRepTime }). Diğer state'ler bu hareket için gerekli olmayabilir.
    * @param {Object} config - Yapılandırma (örn: minScore). angleThreshold burada UP_THRESHOLD'u ezmek için kullanılabilir.
    * @param {Object} historyRef - Yumuşatma geçmişi için useRef objesi.
    * @returns {Object} Yapılması gereken state güncellemelerini içeren obje ({ nextPhase, repIncreased, newDepth, error, smoothedAngle }).
    */
    export const checkBicepsCurlLogic = (keypoints, currentState, config, historyRef) => {
      const { minScore = 0.1, angleThreshold } = config; // minScore'u config'den al
      const { movementPhase } = currentState; // Sadece faz bilgisi yeterli
    
        console.log("--- Biceps Curl Logic Frame ---");
        console.log("Current Phase:", movementPhase);
        console.log("Min Score Config:", minScore);
    
    
      // Gerekli noktaları bul ve güvenilirlik skorlarını kontrol et
      const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));
      const allPointsValid = points.every(p => p && p.score >= minScore);
    
        console.log("Keypoint Scores:", points.map(p => p ? `${p.name}:${p.score.toFixed(2)}` : 'missing'));
        console.log("All Required Points Valid:", allPointsValid);
    
    
      // Noktalar eksikse veya güvenilir değilse erken çık
      if (!allPointsValid) {
        // Keypointler kaybedilirse fazı initial'a çekmek isteyebilirsiniz
        // veya mevcut fazda kalıp hata döndürebilirsiniz.
        if (movementPhase !== 'initial') { // Eğer pozun ortasındaysa hata bildir
                   console.warn("Biceps Curl Logic: Exiting early due to low confidence or missing points.");
          return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Biceps Curl: Keypoints missing or confidence too low", smoothedAngle: NaN }; // Hata durumunda açıyı NaN döndür
        }
               console.log("Biceps Curl Logic: Exiting early (initial) due to low confidence or missing points.");
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: null, smoothedAngle: NaN }; // Initial'daysa hata bildirme
      }
    
      // Gerekli keypoint'leri al
      const [lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist] = points;
    
      // Dirsek açılarını hesapla
      const leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
      const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);
    
        console.log(`Raw Angles: Left=${isNaN(leftAngle) ? 'NaN' : leftAngle.toFixed(1)}, Right=${isNaN(rightAngle) ? 'NaN' : rightAngle.toFixed(1)}`);
    
    
      // Açılar NaN ise erken çık
      if (isNaN(leftAngle) || isNaN(rightAngle)) {
        if (movementPhase !== 'initial') {
                   console.warn("Biceps Curl Logic: Exiting early due to NaN angle calculation.");
          return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Biceps Curl: NaN angle calculation", smoothedAngle: NaN };
        }
               console.log("Biceps Curl Logic: Exiting early (initial) due to NaN angle calculation.");
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: null, smoothedAngle: NaN };
      }
    
      // İki dirsek açısından ortalama olanı al ve yumuşat
      // Alternatif olarak sol ve sağ açıyı ayrı ayrı takip edip, ikisi de eşikleri geçtiğinde sayabilirsiniz.
      // Basitlik için ortalama kullanılıyor.
      const avgAngle = (leftAngle + rightAngle) / 2;
      const smoothedAngle = smoothValue("bicep_curl_avg_angle", avgAngle, historyRef, SMOOTHING_HISTORY_LENGTH);
    
        console.log(`Avg Angle: ${avgAngle.toFixed(1)}, Smoothed Angle: ${isNaN(smoothedAngle) ? 'NaN' : smoothedAngle.toFixed(1)}`);
    
    
      // Yumuşatılmış açı NaN ise erken çık
      if (isNaN(smoothedAngle)) {
        if (movementPhase !== 'initial') {
                   console.warn("Biceps Curl Logic: Exiting early due to NaN smoothed angle.");
          return { nextPhase: movementPhase, repIncreased: false, newDepth: 0, error: "Biceps Curl: NaN smoothed angle", smoothedAngle: NaN };
        }
               console.log("Biceps Curl Logic: Exiting early (initial) due to NaN smoothed angle.");
        return { nextPhase: 'initial', repIncreased: false, newDepth: 0, error: null, smoothedAngle: NaN };
      }
    
    
      // Hareket eşiklerini belirle (konfigürasyondan gelen angleThreshold Up eşiğini ezebilir)
      const downThreshold = DEFAULT_DOWN_THRESHOLD;
      const upThreshold = angleThreshold !== undefined ? angleThreshold : DEFAULT_UP_THRESHOLD;
    
        console.log(`Thresholds: Down=${downThreshold}, Up=${upThreshold}`);
    
    
      let nextPhase = movementPhase;
      let repIncreased = false;
      let newDepth = 0; // Biceps curl için derinlik 0 kalabilir veya açının yüzdesi hesaplanabilir.
        let feedback = null; // Feedback değişkeni
    
    
      // İsteğe bağlı: Hareketin derinliğini göstermek için açı yüzdesi hesaplanabilir.
      // newDepth = calculateAngleDepthPercentage(smoothedAngle, downThreshold, upThreshold);
    
    
      // --- Faz Geçiş Mantığı ---
      // Genellikle "yukarıda başla" -> "aşağı in" -> "yukarı çık (rep tamamla)" döngüsü
      if (movementPhase === "initial" || movementPhase === "up") {
        // Eğer kol bükülmüş pozisyona gelinirse fazı "down" yap
        // Not: Biceps Curl'de kol bükülmüş pozisyon dirsek açısının *küçük* olduğu pozisyondur.
        // Bu nedenle smoothedAngle < downThreshold kullanılır.
        if (smoothedAngle < downThreshold) {
          nextPhase = "down";
                console.log(`Phase Transition: ${movementPhase} -> ${nextPhase} (Angle ${smoothedAngle.toFixed(1)} < ${downThreshold})`);
        } else if (smoothedAngle > upThreshold) {
                 // Zaten 'up' fazındaysa ve hala eşiğin üzerindeyse 'up'ta kalır.
                 // 'initial' fazındayken de 'up' eşiğinin üzerindeyse 'initial'da kalır.
                 nextPhase = movementPhase; // Fazı değiştirmeden devam et
             }
    
    
      } else if (movementPhase === "down") {
        // Eğer kol düz pozisyona geri dönülürse fazı "up" yap ve rep artış sinyali ver
        // Not: Biceps Curl'de kol düz pozisyon dirsek açısının *büyük* olduğu pozisyondur.
        // Bu nedenle smoothedAngle > upThreshold kullanılır.
        if (smoothedAngle > upThreshold) {
          repIncreased = true; // Ana hook'a rep sayması için sinyal ver
          nextPhase = "up"; // Fazı "up" olarak güncelle
                console.log(`Phase Transition: ${movementPhase} -> ${nextPhase} (Angle ${smoothedAngle.toFixed(1)} > ${upThreshold}) - Signaling Rep Increase`);
        } else if (smoothedAngle < downThreshold) {
                 // Zaten 'down' fazındaysa ve hala eşiğin altındaysa 'down'da kalır.
                 nextPhase = movementPhase; // Fazı değiştirmeden devam et
             }
      }
        // --- Faz Geçiş Mantığı Sonu ---
    
        // --- Form Geri Bildirimi Mantığı (Basit Örnekler) ---
        // Sadece 'down' fazındayken (kol bükülürken) derinlik kontrolü
        if (movementPhase === 'down') {
            // Kol yeterince bükülmediyse
            if (smoothedAngle > (downThreshold + 15)) { // Eşiğin belirgin bir miktar (örn: 15 derece) üstünde kalıyorsa
                feedback = "Kolu daha çok bükün!";
            }
            // Belki kol tam düzken başlamadıysa da feedback verilebilir (faz 'initial' veya 'up' iken)
        } else if (movementPhase === 'up') {
             // Kol yeterince açılmadıysa (rep tamamlandıktan sonra)
             if (smoothedAngle < (upThreshold - 10)) { // Eşiğin biraz altında kalıyorsa
                 feedback = "Kolu tam açın!";
             }
        }
        // Not: Daha karmaşık form kontrolleri (örn: dirsekleri sabit tutma) ek keypointlere veya hız/konum değişimlerine bakmayı gerektirebilir.
        // --- Form Geri Bildirimi Sonu ---
    
    
        console.log(`Returning: nextPhase=${nextPhase}, repIncreased=${repIncreased}, newDepth=${newDepth}, smoothedAngle=${isNaN(smoothedAngle) ? 'NaN' : smoothedAngle.toFixed(1)}, feedback="${feedback}"`);
        console.log("------------------------");
    
      // Ana hook'un state'lerini güncellemek için önerileri döndür
      return {
        nextPhase,
        repIncreased,
        newDepth, // Derinliği gösteriyorsanız newDepth'i ekleyin, yoksa 0 olarak bırakın.
        error: null, // Hata varsa buraya ekleyin
             feedback, // Feedback'i döndür
             smoothedAngle, // Yumuşatılmış açıyı döndür
      };
    };