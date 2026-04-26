const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinOrderRoom', (orderId) => {
    socket.join(orderId);
  });

  socket.on('driverLocationUpdate', (data) => {
    // data: { orderId, lat, lng, etaMinutes, status }
    io.to(data.orderId).emit('locationUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});