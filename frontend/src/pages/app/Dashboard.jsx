import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { dashboardService } from '../../services/dashboard.service';
import { renderActivityText } from '../../utils/activityFormatters';
import CreateWorkspaceModal from '../../components/workspaces/CreateWorkspaceModal';

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      <>
        <div className="mx-auto max-w-lg mt-20">
          <div className="bg-white px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:p-10 text-center">
            <svg className="mx-auto h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-2">Welcome to ProjectFlow</h3>
            <p className="text-sm leading-6 text-gray-500 mb-8 max-w-sm mx-auto">
              You don't belong to any workspace yet. Create a workspace to start managing projects.
            </p>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create Your First Workspace
            </button>
          </div>
        </div>
        
        <CreateWorkspaceModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </>
    );
  }

  // Have workspace — check error state first
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

  if (dashboardLoading || !dashboardData) {
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
                        <p className="text-sm text-gray-500">
                          {renderActivityText(activity)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
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
