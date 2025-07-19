import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import { getCurrentUser, logout } from './services/apiService';
import type { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("No user session found.", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = useCallback(() => {
    logout();
    setCurrentUser(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {currentUser ? (
        <DashboardPage user={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
