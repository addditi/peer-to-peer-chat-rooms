import React from 'react';
import { Message } from '../types/mod';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.sender.username}</strong>: {message.content}
          <small>{new Date(message.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};
