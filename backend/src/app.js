const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const { workspaceProjectRouter, projectRouter } = require('./routes/project.routes');
const { projectTaskRouter, taskRouter } = require('./routes/task.routes');
const activityRoutes = require('./routes/activity.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/projects', workspaceProjectRouter);
app.use('/api/workspaces/:workspaceId/dashboard', dashboardRoutes);
app.use('/api/projects/:projectId/tasks', projectTaskRouter);
app.use('/api/projects/:projectId/activities', activityRoutes);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);

// Health / Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ProjectFlow API is running' });
});

module.exports = app;
