export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  chatRoomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: User[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}
