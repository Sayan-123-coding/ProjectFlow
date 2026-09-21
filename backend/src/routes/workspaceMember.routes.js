const express = require('express');
const {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember
} = require('../controllers/workspaceMember.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getMembers);
router.post('/', addMember);
router.patch('/:memberId', updateMemberRole);
router.delete('/:memberId', removeMember);

module.exports = router;
