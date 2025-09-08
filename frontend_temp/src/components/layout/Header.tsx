'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Wifi, WifiOff, User, LogOut } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface HeaderProps {
  title: string;
  showConnectionStatus?: boolean;
  gateId?: string;
}

export default function Header({ title, showConnectionStatus = false, gateId }: HeaderProps) {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { connectionState, isConnected } = useWebSocket(gateId);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getConnectionStatus = () => {
    if (!showConnectionStatus) return null;
    
    switch (connectionState) {
      case 'connecting':
        return (
          <div className="flex items-center text-yellow-600">
            <Wifi className="w-4 h-4 mr-1 animate-pulse" />
            <span className="text-sm">Connecting...</span>
          </div>
        );
      case 'open':
        return (
          <div className="flex items-center text-green-600">
            <Wifi className="w-4 h-4 mr-1" />
            <span className="text-sm">Connected</span>
          </div>
        );
      case 'closed':
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <WifiOff className="w-4 h-4 mr-1" />
            <span className="text-sm">Disconnected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {showConnectionStatus && (
              <div className="ml-4">
                {getConnectionStatus()}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
            
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{user.username}</span>
                  <span className="text-gray-400">({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
