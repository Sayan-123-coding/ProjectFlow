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
          <div className="surface-2 px-4 py-8 sm:rounded-2xl sm:p-10 text-center border-t-2 border-t-pf-400">
            <svg className="mx-auto h-12 w-12 text-pf-400 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-2xl font-bold leading-9 tracking-tight text-pf-100 mb-2">Welcome to ProjectFlow</h3>
            <p className="text-sm leading-6 text-pf-400 mb-8 max-w-sm mx-auto">
              You don't belong to any workspace yet. Create a workspace to start managing projects.
            </p>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-pf-800/30 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-pf-100 tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h2>
          <p className="mt-1.5 text-sm text-pf-400">
            Here's what's happening in <span className="text-pf-200 font-medium">{currentWorkspace?.name}</span> today.
          </p>
        </div>
      </div>

      {/* Primary Overview Area */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Productivity Card spans 2 cols */}
        <div className="surface-2 p-6 rounded-2xl flex flex-col justify-between lg:col-span-2 relative overflow-hidden">

          <div>
            <h3 className="text-sm font-semibold text-pf-400 uppercase tracking-wider mb-1">Overall Progress</h3>
            <div className="flex items-end gap-3 mt-4">
              <span className="text-5xl font-bold text-pf-100">{summary.completionPercentage}%</span>
              <span className="text-sm text-pf-400 mb-1.5">completion across {summary.totalProjects} projects</span>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-pf-400 mb-2 font-medium">
              <span>{summary.completedTasks} Tasks Completed</span>
              <span>{summary.totalTasks} Total Tasks</span>
            </div>
            <div className="w-full bg-pf-900/50 rounded-full h-2 overflow-hidden border border-pf-800/50">
              <div 
                className="bg-pf-400 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="surface-1 p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-pf-400">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-pf-400 uppercase tracking-wider">Action Items</h3>
              <div className="w-8 h-8 rounded-full bg-pf-800/30 flex items-center justify-center border border-pf-600/20">
                <svg className="w-4 h-4 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold text-pf-100">{summary.inProgressTasks + summary.todoTasks}</span>
              <p className="text-sm text-pf-400 mt-1">Pending tasks</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-pf-800/30 flex justify-between items-center">
            {summary.overdueTasks > 0 ? (
              <span className="badge-red px-3 py-1.5">{summary.overdueTasks} Overdue</span>
            ) : (
              <span className="text-sm text-pf-400 flex items-center">
                <svg className="w-4 h-4 mr-1 text-[rgba(74,222,128,0.9)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                All on track
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects Summary */}
        <div className="surface-1 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-pf-800/30 bg-pf-900/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-pf-100 uppercase tracking-wider">Active Projects</h3>
          </div>
          <div className="flex-1 p-0">
            <ul className="divide-y divide-pf-800/20">
              {projects && projects.length > 0 ? (
                projects.map(project => (
                  <li key={project.id} className="px-6 py-5 hover:bg-pf-800/10 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <p className="truncate text-sm font-medium text-pf-200 group-hover:text-pf-100 transition-colors">{project.name}</p>
                      <span className="badge-neutral">{project.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-pf-900/30 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div className="bg-pf-600 h-full rounded-full" style={{ width: `${project.completionPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-pf-400 font-medium">
                      <span className="text-pf-200">{project.completedTasks}</span> of {project.totalTasks} tasks completed
                    </p>
                  </li>
                ))
              ) : (
                <li className="px-6 py-10 text-sm text-pf-400 text-center">No projects in this workspace.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="surface-1 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-pf-800/30 bg-pf-900/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-pf-100 uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="flex-1 p-0">
            <ul className="divide-y divide-pf-800/20">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <li key={activity.id} className="px-6 py-4 hover:bg-pf-800/10 transition-colors flex gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-pf-600"></div>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm text-pf-200 leading-snug">
                        {renderActivityText(activity)}
                      </p>
                      <p className="text-xs font-medium text-pf-400">
                        {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-6 py-10 text-sm text-pf-400 text-center">No recent activity.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
