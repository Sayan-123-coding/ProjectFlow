const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const workspaceRoutes = require('./routes/workspace.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Health / Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ProjectFlow API is running' });
});

module.exports = app;
