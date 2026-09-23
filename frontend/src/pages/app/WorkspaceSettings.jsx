import { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { workspaceService } from '../../services/workspace.service';
import WorkspaceMembers from '../../components/workspaces/WorkspaceMembers';

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const { currentWorkspace, workspaces, loading: wsLoading, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // We need to fetch the current user's role to display in Workspace Information
  const [myRole, setMyRole] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchWorkspaceInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch workspace details
        const { workspace: wsData } = await workspaceService.getWorkspace(workspaceId);
        
        // 2. Fetch members to determine current user's role
        const { members } = await workspaceService.getWorkspaceMembers(workspaceId);
        
        if (isMounted) {
          setWorkspace(wsData);
          const currentUserMember = members.find(m => m.userId === user?.id);
          if (currentUserMember) {
            setMyRole(currentUserMember.role);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.status === 403 ? "You don't have access to this workspace settings." : "Unable to load workspace settings.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (workspaceId) {
      fetchWorkspaceInfo();
    }
    
    return () => {
      isMounted = false;
    };
  }, [workspaceId, user?.id]);

  const handleDeleteWorkspace = async () => {
    if (!window.confirm("Are you sure you want to delete this workspace? All projects, tasks, and data will be permanently removed. This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      await refreshWorkspaces();
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete workspace');
      setIsDeleting(false);
    }
  };

  if (wsLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-gray-500">Loading workspace settings...</div>
      </div>
    );
  }

  // If we couldn't load the workspace (e.g., 404 or 403)
  if (error || !workspace) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error || "Workspace not found."}</p>
          </div>
          <div className="mt-4">
            <Link to="/dashboard" className="text-sm font-medium text-red-800 hover:text-red-700">
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Security measure: if URL doesn't match currentWorkspace context, user might have navigated manually
  // This is allowed as long as they have access, but it's usually better to be explicit. 
  // However, the instructions say: "Ensure the settings page never silently displays members from the wrong workspace."
  // Which we handle by using workspaceId from URL params for all queries.

  return (
    <div className="max-w-7xl mx-auto space-y-10 relative z-10">
      <div className="md:flex md:items-center md:justify-between pb-5 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-pf-600/50 via-pf-400/20 to-transparent"></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-extrabold leading-tight text-slate-800 sm:truncate tracking-wide">
            Workspace Settings
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/dashboard"
            className="btn-secondary"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-extrabold leading-7 text-slate-700">Workspace Information</h2>
          <p className="mt-1 text-sm leading-6 font-medium text-slate-500">
            General information about your workspace.
          </p>
        </div>

        <div className="glass-panel overflow-hidden sm:rounded-2xl md:col-span-2 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pf-600 to-transparent"></div>
          <div className="px-5 py-6 sm:p-8 space-y-6 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">Workspace Name</h3>
              <p className="mt-2 text-[15px] text-white font-bold tracking-wide">{workspace.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">Workspace Description</h3>
              <p className="mt-2 text-[15px] font-medium text-pf-200/90 whitespace-pre-wrap leading-relaxed">
                {workspace.description || <span className="text-pf-600/70 italic font-medium">No description</span>}
              </p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">Your Role</h3>
              <div className="mt-3">
                <span className="inline-flex items-center rounded-md bg-white/5 px-3 py-1.5 text-xs font-bold text-pf-200 border border-white/10 shadow-inner">
                  {myRole || 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-2">
          <div className="border-t border-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-extrabold leading-7 text-slate-700">Members</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            Manage who has access to this workspace and their roles.
          </p>
        </div>

        <div className="md:col-span-2">
          <WorkspaceMembers workspaceId={workspaceId} />
        </div>
      </div>

      {myRole === 'OWNER' && (
        <>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-2">
              <div className="border-t border-white/10" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3 pb-12">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-extrabold leading-7 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">Danger Zone</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-pf-200/80">
                Irreversible actions for this workspace.
              </p>
            </div>

            <div className="bg-red-950/20 backdrop-blur-md shadow-sm border border-red-500/30 sm:rounded-2xl md:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-transparent"></div>
              <div className="px-5 py-6 sm:p-8 relative z-10">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest drop-shadow-sm">Delete Workspace</h3>
                    <p className="mt-2 text-[13px] text-red-200/80 font-medium leading-relaxed">
                      Permanently delete this workspace and all of its data. This action is not reversible.
                    </p>
                  </div>
                  <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
                    <button
                      type="button"
                      onClick={handleDeleteWorkspace}
                      disabled={isDeleting}
                      className="inline-flex items-center rounded-lg bg-red-900/40 border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-800/50 hover:text-red-100 transition-colors disabled:opacity-50 tracking-wide"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete workspace'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
