const chatService = require('../services/chatservice');

class ChatController {
  async createChatRoom(req, res) {
    try {
      const { name } = req.body;
      const chatRoom = await chatService.createChatRoom(
        name, 
        req.user.id
      );
      res.status(201).json(chatRoom);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getChatRooms(req, res) {
    try {
      const chatRooms = await chatService.getChatRooms(req.user.id);
      res.json(chatRooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ChatController();