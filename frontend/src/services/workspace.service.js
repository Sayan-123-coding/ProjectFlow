import { api } from './api';

export const workspaceService = {
  getWorkspaces: async () => {
    return api.get('/workspaces');
  },
  
  getWorkspace: async (workspaceId) => {
    return api.get(`/workspaces/${workspaceId}`);
  },
  
  createWorkspace: async (data) => {
    return api.post('/workspaces', data);
  }
};
