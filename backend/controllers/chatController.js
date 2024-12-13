import { ChatRoom } from './model/chatRoom';
import { User } from './model/user'; 

// Controller for creating a new chat room
const createChatRoom = async (req, res) => {
    try {
        const { name } = req.body;
        const user = req.user; 

        
        const chatRoom = await ChatRoom.createChatRoom(name, user);

        res.status(201).json({
            message: 'Chat room created successfully',
            chatRoom,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// Controller for deleting a chat room
const deleteChatRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const user = req.user; // Get the authenticated user

        // Use the deleteChatRoom method from the ChatRoom model
        const deletedChatRoom = await ChatRoom.deleteChatRoom(roomId, user);

        res.status(200).json({
            message: 'Chat room deleted successfully',
            deletedChatRoom,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// Controller for adding a member to a chat room
const addMemberToChatRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;
        
        // Find the chat room
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
            throw new Error('Chat room not found');
        }

        
        const updatedChatRoom = await chatRoom.addMember(userId);

        res.status(200).json({
            message: 'User added to the chat room successfully',
            updatedChatRoom,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// Controller for removing a member from a chat room
const removeMemberFromChatRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        // Find the chat room
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
            throw new Error('Chat room not found');
        }

        // Remove the member from the chat room
        const updatedChatRoom = await chatRoom.removeMember(userId);

        res.status(200).json({
            message: 'User removed from the chat room successfully',
            updatedChatRoom,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// Controller for fetching all chat rooms
const getAllChatRooms = async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find();
        res.status(200).json(chatRooms);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// Controller for fetching a specific chat room by ID
const getChatRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find chat room by ID
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
            throw new Error('Chat room not found');
        }

        res.status(200).json(chatRoom);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

export {
    createChatRoom,
    deleteChatRoom,
    addMemberToChatRoom,
    removeMemberFromChatRoom,
    getAllChatRooms,
    getChatRoomById,
};
