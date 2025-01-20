import { io } from 'socket.io-client';

// Socket.IO konfiguratsiyasi
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://adderapi.mixmall.uz'  // Production API URL
  : '/';                           // Development uchun

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['polling'], // Faqat polling ishlatamiz, WebSocket muammoli
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: true,
  withCredentials: true, // CORS uchun
});

// Xatoliklarni qayta ishlash
let retryCount = 0;
const MAX_RETRIES = 3;

// Ulanish holatlarini kuzatish
socket.on('connect', () => {
  console.log('Socket.IO serverga ulandi:', socket.id);
  retryCount = 0;
});

socket.on('disconnect', (reason) => {
  console.log('Socket.IO serverdan uzildi. Sabab:', reason);
  
  if (reason === 'io server disconnect' && retryCount < MAX_RETRIES) {
    socket.connect();
    retryCount++;
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO ulanish xatosi:', error.message);
  retryCount++;
  
  if (retryCount >= MAX_RETRIES) {
    console.log('Ulanish urinishlari tugadi');
    socket.disconnect();
  }
});

socket.on('error', (error) => {
  console.error('Socket.IO xatolik:', error);
});

// Qayta ulanishni kuzatish
socket.io.on("reconnect_attempt", (attempt) => {
  if (attempt > MAX_RETRIES) {
    socket.disconnect();
    console.log('Socket.IO qayta ulanish urinishlari tugadi');
    return;
  }
  console.log(`Qayta ulanish urinishi: ${attempt}`);
});

socket.io.on("reconnect", (attempt) => {
  console.log(`${attempt}-urinishda qayta ulandi`);
  retryCount = 0;
});

export { socket };
