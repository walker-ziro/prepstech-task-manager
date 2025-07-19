import React, { useState } from 'react';
import { signIn, signUp } from '../services/apiService';
import type { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
    }
    
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
        setError('Email and password are required.');
        return;
    }
    
    if (!isLoginView) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message || 'Invalid password');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    
    setIsLoading(true);

    try {
      let user: User;
      if (isLoginView) {
        const response = await signIn(email, password);
        user = response.user;
      } else {
        const response = await signUp(email, password);
        user = response.user;
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Prepstech Task Manager</h1>
            <p className="text-slate-400">
                {isLoginView ? 'Welcome back! Please sign in.' : 'Create an account to get started.'}
            </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-300 block mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-300 block mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {!isLoginView && password && (
              <div className="mt-2 space-y-1">
                <div className="text-xs text-slate-400">Password requirements:</div>
                <ul className="text-xs space-y-1">
                  <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-400' : 'text-slate-400'}`}>
                    <span className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1 ${/(?=.*[a-z])/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                    <span className={`w-1 h-1 rounded-full ${/(?=.*[a-z])/.test(password) ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                    One lowercase letter
                  </li>
                  <li className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                    <span className={`w-1 h-1 rounded-full ${/(?=.*[A-Z])/.test(password) ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-1 ${/(?=.*\d)/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                    <span className={`w-1 h-1 rounded-full ${/(?=.*\d)/.test(password) ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                    One number
                  </li>
                  <li className={`flex items-center gap-1 ${/(?=.*[@$!%*?&])/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                    <span className={`w-1 h-1 rounded-full ${/(?=.*[@$!%*?&])/.test(password) ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            )}
          </div>
          {!isLoginView && (
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-slate-300 block mb-2">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 disabled:bg-sky-800 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div> : (isLoginView ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        <p className="text-sm text-center text-slate-400">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => !isLoading && setIsLoginView(!isLoginView)} className="font-medium text-sky-400 hover:text-sky-300 ml-1 disabled:opacity-50" disabled={isLoading}>
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;