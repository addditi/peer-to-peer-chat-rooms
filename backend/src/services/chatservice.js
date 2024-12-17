const ChatRoom = require('../model/chatroom');
const Message = require('../model/message');

class ChatService {
  async createChatRoom(name, createdBy) {
    const chatRoom = new ChatRoom({
      name,
      participants: [createdBy],
      createdBy
    });

    await chatRoom.save();
    return chatRoom;
  }

  async getChatRooms(userId) {
    return await ChatRoom.find({ 
      participants: userId 
    }).populate('participants', 'username');
  }

  async sendMessage(chatRoomId, senderId, content) {
    const message = new Message({
      content,
      sender: senderId,
      chatRoom: chatRoomId
    });

    await message.save();

    // Optionally, add user to chat room participants if not already in
    await ChatRoom.findByIdAndUpdate(
      chatRoomId, 
      { $addToSet: { participants: senderId } }
    );

    return message;
  }

  async getMessages(chatRoomId) {
    return await Message.find({ chatRoom: chatRoomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
  }
}

module.exports = new ChatService();