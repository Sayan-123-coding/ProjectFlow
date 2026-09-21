const express = require('express');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace
} = require('../controllers/workspace.controller');
const authMiddleware = require('../middleware/auth.middleware');
const memberRoutes = require('./workspaceMember.routes');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:workspaceId', getWorkspace);
router.patch('/:workspaceId', updateWorkspace);
router.delete('/:workspaceId', deleteWorkspace);

// Mount members routes under a specific workspace
router.use('/:workspaceId/members', memberRoutes);

module.exports = router;
