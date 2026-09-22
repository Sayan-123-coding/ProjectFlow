import { api } from './api';

export const projectMemberService = {
  getProjectMembers: async (projectId) => {
    return api.get(`/projects/${projectId}/members`);
  },
  
  addProjectMember: async (projectId, data) => {
    return api.post(`/projects/${projectId}/members`, data);
  },
  
  updateProjectMember: async (projectId, memberId, data) => {
    return api.patch(`/projects/${projectId}/members/${memberId}`, data);
  },
  
  removeProjectMember: async (projectId, memberId) => {
    return api.delete(`/projects/${projectId}/members/${memberId}`);
  }
};
