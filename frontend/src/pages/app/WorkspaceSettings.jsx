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
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Workspace Settings
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Workspace Information</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            General information about your workspace.
          </p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Workspace Name</h3>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{workspace.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Workspace Description</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {workspace.description || <span className="text-gray-400 italic">No description</span>}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">Your Role</h3>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {myRole || 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-2">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Members</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
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
              <div className="border-t border-gray-200" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3 pb-12">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7 text-red-600">Danger Zone</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Irreversible actions for this workspace.
              </p>
            </div>

            <div className="bg-red-50 shadow-sm ring-1 ring-red-200 sm:rounded-xl md:col-span-2">
              <div className="px-4 py-6 sm:p-8">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Delete Workspace</h3>
                    <p className="mt-1 text-sm text-red-600">
                      Permanently delete this workspace and all of its data. This action is not reversible.
                    </p>
                  </div>
                  <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
                    <button
                      type="button"
                      onClick={handleDeleteWorkspace}
                      disabled={isDeleting}
                      className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
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
