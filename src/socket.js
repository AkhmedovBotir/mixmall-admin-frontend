import { io } from 'socket.io-client';

// Socket.IO konfiguratsiyasi
const SOCKET_URL = 'https://adderapi.mixmall.uz'; // Production API URL

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: true,
  withCredentials: true,
  auth: {
    token: localStorage.getItem('token')
  }
});

// Ulanish holatlarini kuzatish
socket.on('connect', () => {
  console.log('Socket.IO serverga ulandi:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket.IO serverdan uzildi. Sabab:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO ulanish xatoligi:', error.message);
});

socket.on('error', (error) => {
  console.error('Socket.IO xatolik:', error);
});

// Token o'zgarganda qayta ulash
const updateToken = () => {
  const token = localStorage.getItem('token');
  socket.auth = { token };
  
  if (socket.connected) {
    socket.disconnect().connect();
  }
};

// Login bo'lganda
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Logout bo'lganda
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export { updateToken, connectSocket, disconnectSocket };
export default socket;
