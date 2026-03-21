let io = null;

const init = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user room
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });
    
    // Join admin room
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log('Admin joined admin room');
    });
    
    // Leave room
    socket.on('leave:room', (room) => {
      socket.leave(room);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  init,
  getIO,
};
