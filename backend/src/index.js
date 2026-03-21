const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const socketInit = require('./socket');
const config = require('./config/env');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket
socketInit.init(io);

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to DB and start server
const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ☕  Coffee Shop API Server                          ║
║                                                       ║
║   Server running on port: ${PORT}                      ║
║   Environment: ${config.nodeEnv}                            ║
║   MongoDB: ${config.mongoUri ? 'Connected' : 'Not configured'}                          ║
║                                                       ║
║   Endpoints:                                          ║
║   • Health: http://localhost:${PORT}/health              ║
║   • API:    http://localhost:${PORT}/api                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
