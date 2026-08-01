// utils/geometry.js

// İki nokta arasındaki Öklid mesafesini hesaplar
export const distance = (a, b) => {
    // Noktaların geçerli x, y property'lerine sahip olduğundan emin ol (ekstra güvenlik)
    if (!a || !b || typeof a.x !== 'number' || typeof a.y !== 'number' || typeof b.x !== 'number' || typeof b.y !== 'number') {
         // console.error("Invalid point object provided to distance function");
         return NaN; // Geçersiz inputta NaN döndür
    }
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

// Üç nokta verildiğinde ortadaki noktadaki açıyı derece cinsinden hesaplar (Sağlamlaştırılmış versiyon)
export const calculateAngleRobust = (a, b, c) => {
    // Noktaların geçerliliğini kontrol et (distance fonksiyonu içinde de var ama burada da emin olalım)
     if (!a || !b || !c || typeof a.x !== 'number' || typeof a.y !== 'number' ||
        typeof b.x !== 'number' || typeof b.y !== 'number' ||
        typeof c.x !== 'number' || typeof c.y !== 'number') {
         // console.error("Invalid point object(s) provided to calculateAngle");
         return NaN; // Geçersiz inputta NaN döndür
    }

    const ab = distance(a, b);
    const bc = distance(b, c);
    const ac = distance(a, c);

    // Kenar durum kontrolü: Eğer iki nokta arasındaki mesafe sıfırsa (noktalar çakışıyorsa), geçerli bir açı hesaplanamaz.
    // distance fonksiyonu NaN döndürebilir, onu da kontrol edelim.
    if (isNaN(ab) || isNaN(bc) || ab === 0 || bc === 0) {
        // console.warn("Cannot calculate angle: Points overlap or distance is NaN.");
        return NaN; // Geçersiz durumda NaN döndür
    }

    const numerator = Math.pow(ab, 2) + Math.pow(bc, 2) - Math.pow(ac, 2);
    const denominator = 2 * ab * bc;

    // Math.acos'a gönderilen değerin [-1, 1] aralığında olduğundan emin olun
    // Kayan nokta hataları nedeniyle değer bu aralığın dışına çıkabilir.
    let cosTheta = numerator / denominator;
    cosTheta = Math.max(-1, Math.min(1, cosTheta)); // Değeri [-1, 1] aralığına kısıtla

    const angleInRadians = Math.acos(cosTheta);
    return (angleInRadians * 180) / Math.PI;
};

// calculateAngle olarak sağlamlaştırılmış fonksiyonu dışa aktar
export const calculateAngle = calculateAngleRobust;