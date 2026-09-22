import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { workspaceService } from '../services/workspace.service';

const WorkspaceContext = createContext({});

export const WorkspaceProvider = ({ children }) => {
  const { session, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    try {
      const { workspaces: fetchedWorkspaces } = await workspaceService.getWorkspaces();
      setWorkspaces(fetchedWorkspaces);

      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (fetchedWorkspaces.length > 0) {
        const found = fetchedWorkspaces.find(ws => ws.id === savedWorkspaceId);
        if (found) {
          setCurrentWorkspace(found);
        } else {
          setCurrentWorkspace(fetchedWorkspaces[0]);
          localStorage.setItem('currentWorkspaceId', fetchedWorkspaces[0].id);
        }
      } else {
        setCurrentWorkspace(null);
        localStorage.removeItem('currentWorkspaceId');
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setError('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (authLoading) return;
    
    if (session) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [session, authLoading, fetchWorkspaces]);

  const selectWorkspace = (workspaceId) => {
    const found = workspaces.find(ws => ws.id === workspaceId);
    if (found) {
      setCurrentWorkspace(found);
      localStorage.setItem('currentWorkspaceId', found.id);
    }
  };

  const createWorkspace = async (data) => {
    try {
      const { workspace } = await workspaceService.createWorkspace(data);
      setWorkspaces(prev => [...prev, workspace]);
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspace.id);
      return { workspace, error: null };
    } catch (err) {
      return { workspace: null, error: err.message || 'Failed to create workspace' };
    }
  };

  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  const value = {
    workspaces,
    currentWorkspace,
    loading,
    error,
    selectWorkspace,
    createWorkspace,
    refreshWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};
