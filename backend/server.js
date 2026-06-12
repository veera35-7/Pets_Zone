const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const petRoutes = require('./src/routes/pets');
const adminRoutes = require('./src/routes/admin');
const enquiryRoutes = require('./src/routes/enquiries');
const favoriteRoutes = require('./src/routes/favorites');
const notificationRoutes = require('./src/routes/notifications');
const paymentRoutes = require('./src/routes/payments');
const chatRoutes = require('./src/routes/chat');
const { globalLimiter } = require('./src/middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RV Pets Zone API is running', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect DB and start server
const connectAndStart = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas connected');

    const http = require('http');
    const { Server } = require('socket.io');

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    const userSocketMap = new Map(); // tracks userId -> socket.id

    // Socket.io Real-Time Chat Engine
    io.on('connection', (socket) => {
      socket.on('register_user', (userId) => {
        socket.userId = userId;
        userSocketMap.set(userId, socket.id);
      });

      socket.on('join_room', (roomId) => {
        socket.join(roomId);
      });

      socket.on('send_message', async (data) => {
        const { sender, receiver, message, room } = data;
        try {
          const Chat = require('./src/models/Chat');
          const newChat = await Chat.create({ sender, receiver, message });
          
          io.to(room).emit('receive_message', newChat);
        } catch (err) {
          console.error('Socket send message err:', err.message);
        }
      });

      socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', { isTyping: data.isTyping, sender: data.sender });
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          userSocketMap.delete(socket.userId);
        }
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};

connectAndStart();

module.exports = app;
