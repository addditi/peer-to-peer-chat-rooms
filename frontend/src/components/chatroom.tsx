import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/websocket';
import { chatService } from '../services/chatservice';
import { ChatRoom as ChatRoomType } from '../types/mod';
import { MessageList } from './messagelist';
import { MessageInput } from './messageinput';

export const ChatRoom: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<ChatRoomType | null>(null);
  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [newRoomName, setNewRoomName] = useState('');

  const { messages, sendMessage } = useWebSocket(currentRoom?.id || '');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await chatService.getChatRooms();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Failed to fetch rooms', error);
      }
    };
    fetchRooms();
  }, []);

  const createNewRoom = async () => {
    try {
      const newRoom = await chatService.createChatRoom(newRoomName);
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
    } catch (error) {
      console.error('Failed to create room', error);
    }
  };

  const handleSendMessage = (content: string) => {
    if (currentRoom) {
      sendMessage(content);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="New Room Name"
        />
        <button onClick={createNewRoom}>Create Room</button>
      </div>

      <div>
        {rooms.map(room => (
          <button key={room.id} onClick={() => setCurrentRoom(room)}>
            {room.name}
          </button>
        ))}
      </div>

      {currentRoom && (
        <div>
          <h2>{currentRoom.name}</h2>
          <MessageList messages={messages} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
};
