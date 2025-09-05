const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text:{type:String,required:true},
    senderId:{type:String,Required:true},
    groupId:{type:String,required:true},
    timeStamp:{type:Date, default:Date.now}
});
module.exports = mongoose.model('Message',messageSchema);