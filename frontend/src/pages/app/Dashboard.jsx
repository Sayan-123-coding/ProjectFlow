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
          <div className="glass-panel px-4 py-8 sm:rounded-2xl sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pf-600 via-pf-400 to-pf-600"></div>
            <svg className="mx-auto h-12 w-12 text-pf-400 mb-4 opacity-80 drop-shadow-[0_0_10px_rgba(151,125,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-2xl font-extrabold leading-9 tracking-tight text-white drop-shadow-sm mb-2">Welcome to ProjectFlow</h3>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-pf-600/50 via-pf-400/20 to-transparent"></div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h2>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            Here's what's happening in <span className="text-pf-800 font-bold tracking-wide">{currentWorkspace?.name}</span> today.
          </p>
        </div>
      </div>

      {/* Primary Overview Area */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Productivity Card spans 2 cols */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col justify-between lg:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pf-600/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-pf-400 uppercase tracking-widest mb-1 drop-shadow-sm">Overall Progress</h3>
            <div className="flex items-end gap-3 mt-4">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-pf-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">{summary.completionPercentage}%</span>
              <span className="text-sm font-medium text-pf-200/80 mb-2.5 tracking-wide">completion across {summary.totalProjects} projects</span>
            </div>
          </div>
          <div className="mt-10 relative z-10">
            <div className="flex items-center justify-between text-xs text-pf-200 mb-3 font-bold uppercase tracking-wider">
              <span>{summary.completedTasks} Tasks Completed</span>
              <span>{summary.totalTasks} Total Tasks</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="bg-gradient-to-r from-pf-600 to-pf-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(151,125,255,0.5)]" 
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pf-400 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">Action Items</h3>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <svg className="w-5 h-5 text-pf-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-6">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-pf-200 drop-shadow-sm">{summary.inProgressTasks + summary.todoTasks}</span>
              <p className="text-sm font-medium text-pf-200/80 mt-2 tracking-wide uppercase">Pending tasks</p>
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-white/10 flex justify-between items-center relative z-10">
            {summary.overdueTasks > 0 ? (
              <span className="badge-red px-3 py-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">{summary.overdueTasks} Overdue</span>
            ) : (
              <span className="text-sm font-bold text-emerald-400 flex items-center drop-shadow-sm">
                <svg className="w-5 h-5 mr-1.5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                All on track
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects Summary */}
        <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex items-center justify-between relative">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pf-600/30 to-transparent"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest drop-shadow-sm">Active Projects</h3>
          </div>
          <div className="flex-1 p-0">
            <ul className="divide-y divide-white/5">
              {projects && projects.length > 0 ? (
                projects.map(project => (
                  <li key={project.id} className="px-6 py-5 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <p className="truncate text-sm font-bold text-white transition-colors tracking-wide">{project.name}</p>
                      <span className="badge-neutral font-bold">{project.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 mb-2.5 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-pf-600 to-pf-400 h-full rounded-full shadow-[0_0_8px_rgba(151,125,255,0.5)]" style={{ width: `${project.completionPercentage}%` }}></div>
                    </div>
                    <p className="text-xs font-medium text-pf-200/80 uppercase tracking-wide">
                      <span className="text-pf-200 font-bold">{project.completedTasks}</span> of {project.totalTasks} tasks completed
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
        <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex items-center justify-between relative">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pf-600/30 to-transparent"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest drop-shadow-sm">Recent Activity</h3>
          </div>
          <div className="flex-1 p-0">
            <ul className="divide-y divide-white/5">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <li key={activity.id} className="px-6 py-5 hover:bg-white/5 transition-colors flex gap-4 group">
                    <div className="mt-1 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-pf-400 shadow-[0_0_8px_rgba(151,125,255,0.8)] z-10 relative"></div>
                      <div className="absolute top-3 left-1/2 -ml-[1px] w-[2px] h-full bg-gradient-to-b from-pf-600/50 to-transparent -z-10 group-last:hidden"></div>
                    </div>
                    <div className="flex flex-col space-y-1.5 pb-2">
                      <p className="text-sm font-medium text-white leading-snug drop-shadow-sm">
                        {renderActivityText(activity)}
                      </p>
                      <p className="text-xs font-bold text-pf-200/60 uppercase tracking-wide">
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
