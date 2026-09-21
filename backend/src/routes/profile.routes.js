const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getProfile);
router.patch('/', authMiddleware, updateProfile);

module.exports = router;
