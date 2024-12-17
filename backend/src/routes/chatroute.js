const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/rooms', chatController.createChatRoom);
router.get('/rooms', chatController.getChatRooms);

module.exports = router;