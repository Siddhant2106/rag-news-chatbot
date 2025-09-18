import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com' 
  : 'http://localhost:5000';

export const socket = io(SOCKET_URL);

export const joinSession = (sessionId) => {
  socket.emit('join_session', sessionId);
};

export const sendMessage = (data) => {
  socket.emit('send_message', data);
};

export const onMessageReceived = (callback) => {
  socket.on('receive_message', callback);
};

export const onError = (callback) => {
  socket.on('error', callback);
};
