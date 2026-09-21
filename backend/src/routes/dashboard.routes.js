const express = require('express');
const { getWorkspaceDashboard } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/', getWorkspaceDashboard);

module.exports = router;
