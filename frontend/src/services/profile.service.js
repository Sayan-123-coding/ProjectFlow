import { api } from './api';

export const profileService = {
  getProfile: async () => {
    return api.get('/profile');
  },
  
  updateProfile: async (data) => {
    return api.patch('/profile', data);
  }
};
