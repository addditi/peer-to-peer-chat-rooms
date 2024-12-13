import mongoose from 'mongoose';

// Chat Room Schema
const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Static Method: Create a Chat Room (Admin Only)
ChatRoomSchema.statics.createChatRoom = async function (name, user) {
  if (user.role !== 'Admin') {
    throw new Error('Permission denied: Only admins can create chat rooms.');
  }
  
  try {
    const existingRoom = await this.findOne({ name });
    if (existingRoom) {
      throw new Error('Chat room with this name already exists.');
    }
    
    const newRoom = new this({ 
      name, 
      members: [] 
    });
    
    await newRoom.save();
    return newRoom;
  } catch (error) {
    throw new Error(`Failed to create chat room: ${error.message}`);
  }
};

// Static Method: Delete a Chat Room (Admin Only)
ChatRoomSchema.statics.deleteChatRoom = async function (roomId, user) {
  if (user.role !== 'Admin') {
    throw new Error('Permission denied: Only admins can delete chat rooms.');
  }
  
  try {
    const chatRoom = await this.findById(roomId);
    
    if (!chatRoom) {
      throw new Error('Chat room not found.');
    }
    
    if (chatRoom.members.length > 0) {
      throw new Error('Cannot delete chat room: Active members exist.');
    }
    
    await this.findByIdAndDelete(roomId);
    return chatRoom;
  } catch (error) {
    throw new Error(`Failed to delete chat room: ${error.message}`);
  }
};

// Instance Method: Add Member to Chat Room
ChatRoomSchema.methods.addMember = async function (userId) {
  try {
    // Check if user is already a member
    if (this.members.some(member => member.toString() === userId.toString())) {
      throw new Error('User is already a member of this chat room.');
    }
    
    this.members.push(userId);
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Failed to add member: ${error.message}`);
  }
};

// Instance Method: Remove Member from Chat Room
ChatRoomSchema.methods.removeMember = async function (userId) {
  try {
    // Ensure the user is a member before removing
    const initialMembersCount = this.members.length;
    this.members = this.members.filter(member => member.toString() !== userId.toString());
    
    if (initialMembersCount === this.members.length) {
      throw new Error('User is not a member of this chat room.');
    }
    
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }
};

// Instance Method: Check if User is a Member
ChatRoomSchema.methods.isMember = function (userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

// Static Method: Find Chat Rooms by User
ChatRoomSchema.statics.findByUser = async function (userId) {
  try {
    return await this.find({ members: userId });
  } catch (error) {
    throw new Error(`Failed to find chat rooms: ${error.message}`);
  }
};

// Static Method: Get Active Chat Rooms
ChatRoomSchema.statics.getActiveChatRooms = async function () {
  try {
    return await this.find({ isActive: true });
  } catch (error) {
    throw new Error(`Failed to retrieve active chat rooms: ${error.message}`);
  }
};

// Create and Export Model
const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
export { ChatRoom };