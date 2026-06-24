import { api } from './api';

export const authService = {
  login: async (formData: URLSearchParams) => {
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  
  signup: async (data: any) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  }
};
