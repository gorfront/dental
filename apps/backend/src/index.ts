import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import xrayRoutes from './routes/xray.routes';
import serviceRoutes from './routes/service.routes';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/xrays', xrayRoutes);
app.use('/api/services', serviceRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  io.close();
  console.log('All connections closed.');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
