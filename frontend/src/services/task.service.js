import { api } from './api';

export const taskService = {
  getTasks: async (projectId, params = {}) => {
    // Build query string from params object
    const query = new URLSearchParams();
    
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.assignee_id) query.append('assignee_id', params.assignee_id);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },
  
  createTask: async (projectId, data) => {
    return api.post(`/projects/${projectId}/tasks`, data);
  },
  
  getTask: async (taskId) => {
    return api.get(`/tasks/${taskId}`);
  },
  
  updateTask: async (taskId, data) => {
    return api.patch(`/tasks/${taskId}`, data);
  },
  
  deleteTask: async (taskId) => {
    return api.delete(`/tasks/${taskId}`);
  }
};
