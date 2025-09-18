import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rag-chatbot-backend-xs79.onrender.com' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const createSession = async () => {
  const response = await api.post('/chat/session');
  return response.data;
};

export const getSessionHistory = async (sessionId) => {
  const response = await api.get(`/chat/session/${sessionId}/history`);
  return response.data;
};

export const clearSession = async (sessionId) => {
  const response = await api.delete(`/chat/session/${sessionId}`);
  return response.data;
};

export const sendChatMessage = async (sessionId, message, sender = 'user') => {
  const response = await api.post('/chat/message', {
    sessionId,
    message,
    sender
  });
  console.log(response.data);
  return response.data;
};

export default api;
