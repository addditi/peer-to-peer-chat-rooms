import axios from 'axios';
import { ChatRoom, Message } from '../types/mod';

const API_URL = 'http://localhost:5000/api/chat';

export const chatService = {
  async createChatRoom(name: string): Promise<ChatRoom> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/rooms`, 
      { name }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getChatRooms(): Promise<ChatRoom[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async sendMessage(chatRoomId: string, content: string): Promise<Message> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/messages`, 
      { chatRoomId, content }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};