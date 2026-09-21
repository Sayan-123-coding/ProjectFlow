import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { dashboardService } from '../../services/dashboard.service';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { workspaces, currentWorkspace, createWorkspace, loading: wsLoading, error: wsError } = useWorkspace();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Form state for creating a workspace
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchDashboard = async () => {
    if (!currentWorkspace) return;
    
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await dashboardService.getWorkspaceDashboard(currentWorkspace.id);
      setDashboardData(data);
    } catch (err) {
      if (err.status === 403) {
        setDashboardError("You don't have access to this workspace.");
      } else {
        setDashboardError('Unable to load dashboard.');
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentWorkspace]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    
    setIsCreating(true);
    setCreateError(null);
    
    const { error } = await createWorkspace({
      name: newWsName,
      description: newWsDesc
    });
    
    if (error) {
      setCreateError(error);
    }
    
    setIsCreating(false);
  };

  if (wsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading workspaces...</p>
      </div>
    );
  }

  if (wsError) {
    return (
      <div className="rounded-md bg-red-50 p-4 mt-6">
        <p className="text-sm text-red-700">{wsError}</p>
      </div>
    );
  }

  // No workspaces: Show creation form
  if (!currentWorkspace && workspaces.length === 0) {
    return (
      <div className="mx-auto max-w-lg mt-10">
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 text-center">
          <h3 className="text-xl font-medium leading-6 text-gray-900 mb-2">No workspaces yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first workspace to get started.</p>
          
          {createError && (
            <div className="rounded-md bg-red-50 p-4 mb-4 text-sm text-red-700 text-left">
              {createError}
            </div>
          )}
          
          <form onSubmit={handleCreateWorkspace} className="space-y-4 text-left">
            <div>
              <label htmlFor="wsName" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="wsName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="wsDesc" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="wsDesc"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                value={newWsDesc}
                onChange={(e) => setNewWsDesc(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !newWsName.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isCreating ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Have workspace, wait for dashboard loading
  if (dashboardLoading || !dashboardData) {
    if (dashboardError) {
      return (
        <div className="mt-8 text-center">
          <p className="text-red-600 mb-4">{dashboardError}</p>
          <button 
            onClick={fetchDashboard}
            className="rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
          >
            Try again
          </button>
        </div>
      );
    }
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const { summary, projects, recentActivity } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Welcome, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Overview for {currentWorkspace?.name}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Projects / Tasks</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {summary.totalProjects} <span className="text-lg text-gray-400">/ {summary.totalTasks}</span>
            </dd>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Completed / In Progress</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {summary.completedTasks} <span className="text-lg text-gray-400">/ {summary.inProgressTasks}</span>
            </dd>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">To Do / Overdue</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {summary.todoTasks} <span className="text-lg text-red-400">/ {summary.overdueTasks}</span>
            </dd>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Completion</dt>
            <dd className="mt-1 flex items-baseline">
              <span className="text-3xl font-semibold tracking-tight text-gray-900">{summary.completionPercentage}%</span>
            </dd>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${summary.completionPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects Summary */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Projects</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {projects && projects.length > 0 ? (
              projects.map(project => (
                <li key={project.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">{project.name}</p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        {project.completionPercentage}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {project.completedTasks} / {project.totalTasks} tasks completed
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 text-sm text-gray-500">No projects in this workspace.</li>
            )}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Activity</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{activity.actor_name || 'Someone'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.action} {activity.metadata?.details ? `- ${activity.metadata.details}` : ''}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 text-sm text-gray-500">No recent activity.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
