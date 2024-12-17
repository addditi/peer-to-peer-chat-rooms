import axios from 'axios';
import { User } from '../types/mod';

const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
  async register(username: string, email: string, password: string): Promise<User> {
    const response = await axios.post(`${API_URL}/register`, { 
      username, 
      email, 
      password 
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  getCurrentUser(): User | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode JWT to get user info (you'd need a JWT decode utility)
      // This is a placeholder - replace with actual JWT decoding
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id,
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      return null;
    }
  }
};
