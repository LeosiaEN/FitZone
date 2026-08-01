const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Token yoksa hata dönüyoruz
    if (!token) {
        return res.status(401).json({ error: "Token bulunamadı." });
    }

    try {
        // Token'ı doğruluyoruz
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token'ı doğruladıktan sonra, decoded bilgilerini logluyoruz
        console.log("Decoded JWT:", decoded);  // Burada token içeriğini logluyoruz
        
        // Decoded token bilgilerini request'e ekliyoruz
        req.user = decoded;
        
        // Bir sonraki middleware ya da route handler'a geçiyoruz
        next();
    } catch (err) {
        // Eğer token geçersizse hata mesajı veriyoruz
        console.error("Token doğrulama hatası:", err); // Debugging için log
        return res.status(401).json({ error: "Geçersiz token." });
    }
};
