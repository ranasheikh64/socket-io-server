// model/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  senderId: { type: String, required: true },
  channelId: { type: String, required: true }, // required
  timeStamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
