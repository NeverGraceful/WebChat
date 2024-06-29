// server.ts or index.ts
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { userRoutes } from './routes/users'; // Ensure the correct path

const app = express();

// Register CORS middleware with Express
app.use(cors({ origin: process.env.CLIENT_URL }));

// Register JSON middleware
app.use(express.json());

// Register user routes
app.use('/api', userRoutes);

// Create HTTP server and attach Socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Debug socket connections
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3032; // Ensure the port is correctly set
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
