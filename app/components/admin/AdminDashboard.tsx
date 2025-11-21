'use client';

import { useState } from 'react';
import { 
  IconChevronRight, 
  IconUsers, 
  IconPaw, 
  IconMap, 
  IconSettings,
  IconDashboard
} from '@tabler/icons-react';
import AdminUserList from './AdminUserList';
import AdminAnimalList from './AdminAnimalList';
import AdminDetectionList from './AdminDetectionList';
import AdminSettings from './AdminSettings';
import MigrateDatabaseButton from './MigrateDatabaseButton';

type Tab = 'dashboard' | 'users' | 'animals' | 'detections' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <IconDashboard size={18} className="mr-2" />
                  <span>Dashboard</span>
                </div>
                <IconChevronRight
                  size={16}
                  className={activeTab === 'dashboard' ? 'opacity-100' : 'opacity-0'}
                />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <IconUsers size={18} className="mr-2" />
                  <span>Users</span>
                </div>
                <IconChevronRight
                  size={16}
                  className={activeTab === 'users' ? 'opacity-100' : 'opacity-0'}
                />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('animals')}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  activeTab === 'animals' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <IconPaw size={18} className="mr-2" />
                  <span>Animals</span>
                </div>
                <IconChevronRight
                  size={16}
                  className={activeTab === 'animals' ? 'opacity-100' : 'opacity-0'}
                />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('detections')}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  activeTab === 'detections' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <IconMap size={18} className="mr-2" />
                  <span>Detections</span>
                </div>
                <IconChevronRight
                  size={16}
                  className={activeTab === 'detections' ? 'opacity-100' : 'opacity-0'}
                />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <IconSettings size={18} className="mr-2" />
                  <span>Settings</span>
                </div>
                <IconChevronRight
                  size={16}
                  className={activeTab === 'settings' ? 'opacity-100' : 'opacity-0'}
                />
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Database Management</h3>
                <p className="text-gray-600 mb-4">
                  Migrate the mock data from local state to your Prisma database. This operation should
                  only be performed once when setting up the application.
                </p>
                <MigrateDatabaseButton />
              </div>
              {/* Other dashboard cards can be added here */}
            </div>
          </div>
        )}
        {activeTab === 'users' && <AdminUserList />}
        {activeTab === 'animals' && <AdminAnimalList />}
        {activeTab === 'detections' && <AdminDetectionList />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
} 