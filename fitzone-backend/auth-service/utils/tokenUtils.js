const jwt = require('jsonwebtoken');

// token oluşturur
const generateToken = (userId, rememberMe = false) => {
  // "Beni hatırla" seçeneğine göre token süresi belirleniyor
  const expirationTime = rememberMe ? '14d' : '1h';  // Eğer rememberMe true ise 14 gün, yoksa 1 saat

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: expirationTime });
};

module.exports = { generateToken };
