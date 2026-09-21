const express = require('express');
const { getProjectActivities } = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getProjectActivities);

module.exports = router;
