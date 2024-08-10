import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { userRoutes } from './routes/users';
import { Console } from 'console';

const app = express();

// Register CORS middleware with Express
app.use(cors({ origin: process.env.CLIENT_URL }));

// Register JSON middleware
app.use(express.json());

// Register user routes
app.use('/api', userRoutes);

interface Message {
  name: string,
  text: string,
  time: string
}

interface Channel {
  id: string;
  name: string;
  members: string[];
  messages: Message[];
}

let channels: Channel[] = [];

// interface Message {
//   channelId: string;
//   message: string;
// }

// let messages: Message[] = [];

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
    let channel = get_channel(channelId);
    if (channel){
      callback({success: true, channel});
    } else {
      callback({success: false, error: "Channel not found"});
    }
  });

  // Retrieves all channels the user is a member of
  socket.on('get_channels', ({ userId }, callback) => {
    if (!userId) {
      callback({ success: false, error: 'User ID not provided' });
      return;
    }
  
    const userChannels = channels.filter(channel => Array.isArray(channel.members) && channel.members.includes(userId));
  
    if (userChannels.length > 0) {
      callback({ success: true, channels: userChannels });
    } else {
      callback({ success: false, error: 'No channels found for the user' });
    }
  });

  // Moves the user into a channel
  socket.on('join_channel', ({ channelId }) => {
    socket.join(channelId);
    // const channelMessages = messages[channelId] || [];
    socket.emit('get_channel_messages', channelId);
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

  // socket.on('get_channel_messages', (channelId: string, callback) => {
  //   const channel = get_channel(channelId);
  //   if (channel) {
  //     if (channel.messages.length == 0){
  //       console.log("No messages in channel")
  //     }
  //     callback({ success: true, channel: channel.messages });
  //   } else {
  //     callback({ success: false, error: "Couldn't find channel" });
  //   }
  // });

  // socket.on('send_message', (channelId: string, message: Message, callback) => {
  //   const channel = get_channel(channelId);
  //   if (channel) {
  //     channel.messages.push(message);
  //     callback({ success: true, channel: channel.messages });
  //   } else {
  //     callback({ success: false, error: "Couldn't find channel" });
  //   }
  // });

  // socket.on('get_channel_messages', (channel: Channel, callback) => {
  //   if (channel) {
  //     if (channel.messages == undefined){
  //       console.log("No messages in channel")
  //     }
  //     callback({ success: true, channel: channel.messages });
  //   } else {
  //     callback({ success: false, error: "Couldn't find channel" });
  //   }
  // });

  socket.on('send_message', (channel: Channel, message: Message, callback) => {
    if (channel && message != undefined) {
      console.log(message)
      channel.messages.push(message);
      callback({ success: true, channel: channel.messages });
    } else {
      callback({ success: false, error: "Couldn't find channel" });
    }
  });

  socket.on('disconnect', () => {
    console.log("Socket disconnected")
  });
});

const get_channel = (channelId: string) => {
  let channel = channels.find(c => c.id === channelId);
    if (channel) {
      return channel;
    } else {
      return null;
    }
}

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3032; // Ensure the port is correctly set
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
