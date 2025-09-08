'use client';

import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ParkingStateReport from './ParkingStateReport';
import ZoneControl from './ZoneControl';
import CategoryManagement from './CategoryManagement';
import { 
  BarChart3, 
  Settings, 
  DollarSign, 
  Activity,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { connectionState } = useWebSocket();
  const { adminUpdates } = useSelector((state: RootState) => state.admin);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'zones', name: 'Zone Control', icon: Settings },
    { id: 'categories', name: 'Categories', icon: DollarSign },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ParkingStateReport />;
      case 'zones':
        return <ZoneControl />;
      case 'categories':
        return <CategoryManagement />;
      default:
        return <ParkingStateReport />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Parking Management System</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                connectionState === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionState === 'open' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>
                  {connectionState === 'open' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Admin Updates */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">Recent Updates</h3>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adminUpdates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent updates
                  </p>
                ) : (
                  adminUpdates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                      <div className="flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {update.action.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {update.targetType}: {update.targetId}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className={`text-sm font-medium ${
                    connectionState === 'open' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {connectionState === 'open' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Updates Today</span>
                  <span className="text-sm font-medium text-gray-900">
                    {adminUpdates.filter(update => 
                      new Date(update.timestamp).toDateString() === new Date().toDateString()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-sm font-medium text-gray-900">
                    {adminUpdates.length > 0 
                      ? new Date(adminUpdates[0].timestamp).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
