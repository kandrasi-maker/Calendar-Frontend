// src/components/AuthModal.jsx
import { useState } from 'react';
import { Button } from './ui/Button';

export const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login
    onLogin('mock-token', { email });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <Button type="submit" className="w-full">
            {isLogin ? 'Sign In' : 'Register'}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </p>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
          ×
        </button>
      </div>
    </div>
  );
};