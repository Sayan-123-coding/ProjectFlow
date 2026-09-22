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
  },

  getWorkspaceMembers: async (workspaceId) => {
    return api.get(`/workspaces/${workspaceId}/members`);
  },

  addWorkspaceMember: async (workspaceId, data) => {
    return api.post(`/workspaces/${workspaceId}/members`, data);
  },

  updateWorkspaceMember: async (workspaceId, memberId, data) => {
    return api.patch(`/workspaces/${workspaceId}/members/${memberId}`, data);
  },

  removeWorkspaceMember: async (workspaceId, memberId) => {
    return api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  deleteWorkspace: async (workspaceId) => {
    return api.delete(`/workspaces/${workspaceId}`);
  }
};
