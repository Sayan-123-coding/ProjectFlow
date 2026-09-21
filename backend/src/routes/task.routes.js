const express = require('express');
const {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

const projectTaskRouter = express.Router({ mergeParams: true });
projectTaskRouter.use(authMiddleware);
projectTaskRouter.post('/', createTask);
projectTaskRouter.get('/', getProjectTasks);

const taskRouter = express.Router({ mergeParams: true });
taskRouter.use(authMiddleware);
taskRouter.get('/:taskId', getTask);
taskRouter.patch('/:taskId', updateTask);
taskRouter.delete('/:taskId', deleteTask);

module.exports = { projectTaskRouter, taskRouter };
