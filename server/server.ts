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

interface Channel {
  id: string;
  name: string;
  memberIds: string[];
  creatorId: string;
}

let channels: Channel[] = [];

interface Message {
  channelId: string;
  message: string;
}

let messages: Message[] = [];

interface User {
  id: string;
  name: string;
}

let users: User[] = [];

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
  console.log('a user connected', { id: socket.id, address: socket.handshake.address });

  // Generates a unique channel ID
  // const generateChannelId = (): string => {
  //   return Math.random().toString(36).substring(2, 15);
  // };

  // Makes a new channel including all memberIds given
  // socket.on('create_channel', ({ name, memberIds, creatorId }, callback) => {
  //   if (!name || !memberIds || !creatorId) {
  //     callback({ success: false, error: 'Invalid data' });
  //     return;
  //   }

  //   let allMemberIds: string[] = [];
  //   allMemberIds.push(creatorId);
  //   allMemberIds.push(...memberIds);
  
  //   const newChannel: Channel = {
  //     id: generateChannelId(),
  //     name,
  //     memberIds: allMemberIds,
  //     creatorId,
  //   };
  
  //   channels.push(newChannel);
  //   console.log(channels);
  //   callback({ success: true, channel: newChannel });
  // });

  socket.on('update_channels', ({ localChannels }) => {
    if (localChannels != undefined){
      channels.push(...localChannels);
    }
    if (channels != undefined){
      localChannels.push(...channels)
    }
  });

  // Returns channel that corresponds to the channelId given
  socket.on('get_channel', ({ channelId }, callback) => {
    let channel = channels.find(c => c.id === channelId);
    // if (channel == undefined){
    //   channel = localChannels.find(c => c.id === channelId);
    // }
    if (channel) {
      callback({ success: true, channel });
    } else {
      callback({ success: false, error: 'Channel not found' });
    }
  });

  // Retrieves all channels the user is a member of
  socket.on('get_channels', ({ userId }, callback) => {
    if (!userId) {
      callback({ success: false, error: 'User ID not provided' });
      return;
    }
  
    const userChannels = channels.filter(channel => Array.isArray(channel.memberIds) && channel.memberIds.includes(userId));
  
    if (userChannels.length > 0) {
      callback({ success: true, channels: userChannels });
    } else {
      callback({ success: false, error: 'No channels found for the user' });
    }
  });

  // Moves the user into a channel
  socket.on('join_channel', ({ channelId }) => {
    socket.join(channelId);
    const channelMessages = messages[channelId] || [];
    socket.emit('messages', channelMessages);
  });
  
  // Returns all users
  socket.on('get_users', (callback) => {
    callback({ success: true, users });
  });

  // Adds current users and returns all users
  socket.on('add_and_get_users', (clientUsers: User[], callback) => {
    if (!Array.isArray(clientUsers)) {
      callback({ success: false, error: 'Invalid data format', users });
      return;
    }
  
    const newUsers = clientUsers.filter(clientUser => 
      !users.some(user => user.id === clientUser.id)
    );
  
    users.push(...newUsers);
  
    console.log("# of users: ", users.length);
    callback({ success: true, users });
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
