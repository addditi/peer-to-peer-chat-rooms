import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import { AuthForm } from './components/authform';
import { ChatRoom } from './components/chatroom';
import { ProtectedRoute } from './components/protectedroute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
