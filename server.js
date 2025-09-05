// server.js

// প্রয়োজনীয় মডিউলগুলো ইম্পোর্ট করুন
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// এক্সপ্রেস অ্যাপ এবং HTTP সার্ভার তৈরি করুন
const app = express();
const server = http.createServer(app);

// Socket.IO সার্ভার সেটআপ করুন।
// cors অপশনটি খুব গুরুত্বপূর্ণ, কারণ এটি আপনার Flutter অ্যাপকে সার্ভারের সাথে কানেক্ট হতে দেবে।
const io = new Server(server, {
  cors: {
    origin: "*", // আপনার Flutter অ্যাপের ইউআরএল এখানে দিতে পারেন, অথবা "*" ব্যবহার করে সব কানেকশন অনুমতি দিন।
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// একটি সাধারণ রাউট তৈরি করা হয়েছে যাতে সার্ভার চলছে কিনা তা নিশ্চিত করা যায়।
app.get('/', (req, res) => {
  res.send('<h1>Socket.IO Chat Server is Running!</h1>');
});

// যখন কোনো ক্লায়েন্ট সকেটের সাথে কানেক্ট হবে
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ১. চ্যানেল জয়েন করার ইভেন্ট
  // ক্লায়েন্ট থেকে 'joinChannel' ইভেন্ট এলে এই কোড রান হবে
  socket.on('joinChannel', (data) => {
    const channelId = data.channelId;
    console.log(`User ${socket.id} joining channel: ${channelId}`);
    
    // নির্দিষ্ট চ্যানেলে বা রুমে জয়েন করুন
    socket.join(channelId);
    
    // শুধু ওই রুমের ক্লায়েন্টকে একটি কনফার্মেশন মেসেজ পাঠান
    socket.emit('joined', `You have joined channel: ${channelId}`);
  });

  // ২. মেসেজ পাঠানোর ইভেন্ট
  // ক্লায়েন্ট থেকে 'sendMessage' ইভেন্ট এলে এই কোড রান হবে
  socket.on('sendMessage', (data) => {
    const message = data.text;
    const rooms = [...socket.rooms];
    
    // ক্লায়েন্টের সাথে যুক্ত প্রতিটি রুমের জন্য মেসেজটি ব্রডকাস্ট করুন
    rooms.forEach(room => {
      // যদি room-টি সকেট আইডি না হয় (কারণ সকেট তার নিজের আইডি দিয়েও একটি রুমে থাকে)
      if (room !== socket.id) {
        // ওই রুমের সবাইকে 'newMessage' ইভেন্টটি পাঠান
        io.to(room).emit('newMessage', { text: message, senderId: socket.id });
        console.log(`Message sent to channel ${room} by ${socket.id}: "${message}"`);
      }
    });
  });

  // ৩. ক্লায়েন্ট ডিসকানেক্ট হলে
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// সার্ভার চালু করুন
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});