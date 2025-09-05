// server.js

const express = require('express');
const http = require('http');
const Message = require(newFunction());

const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

// Body parser
app.use(bodyParser.json());

const mongoose = require('mongoose');
const { timeStamp } = require('console');
const { Socket } = require('dgram');
const { type } = require('os');

// MongoDB connect
mongoose.connect('mongodb+srv://rofikul6424islam_db_user:pp0E8b5OSlFttuJR@realtimechat.jbjqjwx.mongodb.net/?retryWrites=true&w=majority&appName=realtimechat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// Socket.IO server setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Simple in-memory groups storage
let groups = []; // { groupId, groupName, members: [] }

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Socket.IO Chat Server is Running!</h1>');
});

// API: Create a new group
app.post('/createGroup', (req, res) => {
  const { groupName } = req.body;
  if (!groupName) return res.status(400).json({ error: 'Group name required' });

  const groupId = `group_${Date.now()}`; // simple unique ID
  groups.push({ groupId, groupName, members: [] });

  res.json({ success: true, groupId, groupName });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

socket.on('joinChannel', async (data) => {
  const { channelId } = data;
  console.log(`User ${socket.id} joining channel: ${channelId}`);
  socket.join(channelId);

  // Fetch old messages from MongoDB
  const oldMessages = await Message.find({ channelId }).sort({ timeStamp: 1 });
  socket.emit('oldMessages', oldMessages);

  // Add user to in-memory group
  const group = groups.find(g => g.groupId === channelId);
  if (group && !group.members.includes(socket.id)) {
    group.members.push(socket.id);
  }

  socket.emit('joined', { message: `You have joined channel: ${channelId}` });
});


 socket.on('sendMessage', async (data) => {
  const { text, groupId } = data;

  if (!groupId) return;

  // Save message in MongoDB
  const newMessage = new Message({
    text,
    senderId: socket.id,
    channelId: groupId
  });
  await newMessage.save();

  // Emit to all users in the channel
  io.to(groupId).emit('newMessage', {
    text,
    senderId: socket.id,
    channelId: groupId,
    timeStamp: newMessage.timeStamp,
    type: 'group'
  });

  console.log(`Group message to ${groupId} by ${socket.id}: "${text}"`);
});


  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove user from any group members
    groups.forEach(group => {
      group.members = group.members.filter(id => id !== socket.id);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
function newFunction() {
  return './model/Message';
}

