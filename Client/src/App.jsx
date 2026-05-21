import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './components/Login';
import Register from './components/Register';
import ChatDashboard from './components/ChatDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onToggleRegister={() => setAuthView('register')} />
    ) : (
      <Register onToggleLogin={() => setAuthView('login')} />
    );
  }

  return (
    <ChatProvider>
      <ChatDashboard />
    </ChatProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
