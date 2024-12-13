import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});


MessageSchema.methods.sendMessage = async function () {
  await this.save();
  return this;
};


MessageSchema.statics.getMessagesByRoom = async function (roomId, limit = 10) {
  const messages = await this.find({ chatRoom: roomId })
    .sort({ timestamp: -1 }) // Sort messages by latest first
    .limit(limit); // Limit the number of messages
  return messages;
};


const Message = mongoose.model('Message', MessageSchema);

export { Message };
