import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { ENV } from './config/env.js';
import { setupSockets } from './sockets/index.js';
import prisma from './config/database.js';

const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

setupSockets(io);

// Verify Database Connection and start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully (via Prisma)');

    server.listen(ENV.PORT, () => {
      console.log(`🚀 CookConnect Backend running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${ENV.PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down CookConnect Server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

