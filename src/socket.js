import io from 'socket.io-client';

// Socket.IO serverga ulanish
const socket = io('https://adderapi.mixmall.uz', {
  transports: ['websocket'],
  autoConnect: true
});

// Ulanish holatini kuzatish
socket.on('connect', () => {
  console.log('Socket.IO serverga ulandi');
});

socket.on('disconnect', () => {
  console.log('Socket.IO serverdan uzildi');
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO ulanish xatosi:', error);
});

export { socket };
