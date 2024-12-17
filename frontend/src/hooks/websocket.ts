import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types/mod';

export const useWebSocket = (chatRoomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!chatRoomId) return;

    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:5000/chat?roomId=${chatRoomId}&token=${token}`);

    ws.onopen = () => console.log('WebSocket Connected');
    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, message]);
    };
    ws.onerror = (error) => console.error('WebSocket Error:', error);
    ws.onclose = () => console.log('WebSocket Disconnected');

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [chatRoomId]);

  const sendMessage = useCallback((content: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ content }));
    }
  }, [socket]);

  return { messages, sendMessage };
};
