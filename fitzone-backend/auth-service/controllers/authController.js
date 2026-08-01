const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000;
const specialChars = /[^A-Za-z0-9]/g;

// Kullanıcı kaydı
const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Lütfen e-posta ve parola alanlarını doldurun.' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Geçersiz e-posta formatı.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Parola en az 6 karakter olmalıdır.' });
    }
    if (!specialChars.test(password)) {
        return res.status(400).json({ error: 'Parola en az bir özel karakter içermelidir.' });
    }
    if (password.toLowerCase() === password) {
        return res.status(400).json({ error: 'Parola en az bir büyük harf içermelidir.' });
    }
    if (password.toUpperCase() === password) {
        return res.status(400).json({ error: 'Parola en az bir küçük harf içermelidir.' });
    }
    if (password.includes(email.split('@')[0])) {
        return res.status(400).json({ error: 'Parola, e-posta adresinin kullanıcı adını içermemelidir.' });
    }
    if (password.includes(' ')) {
        return res.status(400).json({ error: 'Parola boşluk içermemelidir.' });
    }
    if (password.length > 20) {
        return res.status(400).json({ error: 'Parola en fazla 20 karakter olmalıdır.' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanımda.' }); 
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });
        res.status(201).json({ message: 'Kayıt başarıyla tamamlandı.', user: { email: user.email } });
    } catch (error) {
        console.error("Kayıt sırasında veritabanı hatası:", error);
        return res.status(400).json({ error: 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.' });
    }
};

// Kullanıcı girişi
const login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const userId = user.id;

        const lockoutTime = loginAttempts.get(userId)?.lockoutUntil;
        if (lockoutTime && Date.now() < lockoutTime) {
            const remainingTime = Math.ceil((lockoutTime - Date.now()) / (60 * 1000)); // Kalan süreyi dakika cinsinden hesapla
            return res.status(429).json({
                error: `Hesabınız ${remainingTime} dakika boyunca kilitlendi. Lütfen daha sonra tekrar deneyin.`,
            });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            const attemptsData = loginAttempts.get(userId) || { attempts: 0 };
            attemptsData.attempts++;
            loginAttempts.set(userId, attemptsData);

            const remainingAttempts = MAX_ATTEMPTS - attemptsData.attempts;

            if (attemptsData.attempts >= MAX_ATTEMPTS) {
                loginAttempts.get(userId).lockoutUntil = Date.now() + LOCKOUT_DURATION;
                return res.status(429).json({
                    error: `Çok fazla hatalı deneme. Hesabınız 1 saat boyunca kilitlendi.`,
                    remainingAttempts: 0,
                });
            }

            return res.status(401).json({ error: 'Hatalı parola', remainingAttempts });
        }

        loginAttempts.delete(userId);

        const expirationTime = rememberMe ? '14d' : '1h';
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: expirationTime });

        res.json({ token });

    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ error: 'Giriş başarısız' });
    }
};

module.exports = { login, register };
