import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { userRoutes } from './routes/users';

const app = express();

// Register CORS middleware with Express
app.use(cors({ origin: process.env.CLIENT_URL }));

// Register JSON middleware
app.use(express.json());

// Register user routes
app.use('/api', userRoutes);

// Sample data
const channels = [
  { id: '1', name: 'General', members: ['1', '2'] },
  { id: '2', name: 'Random', members: ['2', '3'] },
];

const messages = {
  '1': ['Hello General!'],
  '2': ['Hello Random!'],
};

// Create HTTP server and attach Socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Debug socket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('get_channels', ({ userId }) => {
    const userChannels = channels.filter(channel => channel.members.includes(userId));
    socket.emit('channels', userChannels);
  });

  socket.on('join_channel', ({ channelId }) => {
    socket.join(channelId);
    const channelMessages = messages[channelId] || [];
    socket.emit('messages', channelMessages);
  });

  socket.on('send_message', ({ channelId, message }) => {
    if (!messages[channelId]) messages[channelId] = [];
    messages[channelId].push(message);
    io.to(channelId).emit('messages', messages[channelId]);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3032; // Ensure the port is correctly set
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
