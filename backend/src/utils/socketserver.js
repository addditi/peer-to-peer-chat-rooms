const { Server } = require('socket.io');
const { verifyToken } = require('../config/jwt');
const ChatService = require('../services/chatservice');

const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const decoded = verifyToken(token);

    if (decoded) {
      socket.user = decoded;
      next();
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join_room', async (chatRoomId) => {
      socket.join(chatRoomId);
    });

    socket.on('send_message', async (data) => {
      try {
        const message = await ChatService.sendMessage(
          data.chatRoomId, 
          socket.user.id, 
          data.content
        );

        // Broadcast message to room
        io.to(data.chatRoomId).emit('receive_message', message);
      } catch (error) {
        console.error('Message sending error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

module.exports = initializeSocketServer;