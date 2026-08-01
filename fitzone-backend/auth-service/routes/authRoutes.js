const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
 // Rate limiting middleware'i import ettik

// Rate limit middleware'ini ekle
router.post('/register', register); // Rate limit eklenmiş
router.post('/login',  login); // Rate limit eklenmiş

module.exports = router;
