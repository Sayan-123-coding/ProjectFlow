import { api } from './api';

export const projectService = {
  getProjects: async (workspaceId) => {
    return api.get(`/workspaces/${workspaceId}/projects`);
  },
  
  createProject: async (workspaceId, data) => {
    return api.post(`/workspaces/${workspaceId}/projects`, data);
  },
  
  getProject: async (projectId) => {
    return api.get(`/projects/${projectId}`);
  },
  
  updateProject: async (projectId, data) => {
    return api.patch(`/projects/${projectId}`, data);
  },
  
  deleteProject: async (projectId) => {
    return api.delete(`/projects/${projectId}`);
  },
  
  getProjectActivities: async (projectId, params = {}) => {
    const query = new URLSearchParams();
    if (params.task_id) query.append('task_id', params.task_id);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    
    const queryString = query.toString();
    return api.get(`/projects/${projectId}/activities${queryString ? `?${queryString}` : ''}`);
  }
};
