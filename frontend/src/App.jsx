import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AppLayout from './layouts/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/app/Dashboard';
import Landing from './pages/Landing';

import Projects from './pages/app/Projects';
import ProjectDetails from './pages/app/ProjectDetails';
import WorkspaceSettings from './pages/app/WorkspaceSettings';
import ProfileSettings from './pages/app/ProfileSettings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            {/* Public auth routes */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected app routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetails />} />
                <Route path="/workspaces/:workspaceId/settings" element={<WorkspaceSettings />} />
                <Route path="/profile" element={<ProfileSettings />} />
              </Route>
            </Route>

            {/* Redirects are now handled inside PublicRoute and ProtectedRoute */}
            
            {/* Catch-all Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
