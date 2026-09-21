import { api } from './api';

export const dashboardService = {
  getWorkspaceDashboard: async (workspaceId) => {
    return api.get(`/workspaces/${workspaceId}/dashboard`);
  }
};
