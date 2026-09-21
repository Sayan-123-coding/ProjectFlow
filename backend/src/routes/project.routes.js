const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');
const projectMemberRoutes = require('./projectMember.routes');

const workspaceProjectRouter = express.Router({ mergeParams: true });
workspaceProjectRouter.use(authMiddleware);
workspaceProjectRouter.post('/', createProject);
workspaceProjectRouter.get('/', getProjects);

const projectRouter = express.Router({ mergeParams: true });
projectRouter.use(authMiddleware);
projectRouter.get('/:projectId', getProject);
projectRouter.patch('/:projectId', updateProject);
projectRouter.delete('/:projectId', deleteProject);

// Mount members routes
projectRouter.use('/:projectId/members', projectMemberRoutes);

module.exports = { workspaceProjectRouter, projectRouter };
