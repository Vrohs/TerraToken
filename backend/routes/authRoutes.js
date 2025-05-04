const express = require('express');
const { register, login, getMe, logout, syncClerkUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');
const clerkService = require('../services/clerkService');

const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.post('/sync-clerk-user', clerkService.syncClerkUser);

module.exports = router;
