'use client';

import React, { useState, useEffect } from 'react';

type SettingCategory = 'general' | 'security' | 'notification' | 'ai';

interface SystemSetting {
  id: string;
  category: SettingCategory;
  name: string;
  key: string;
  value: string | boolean | number;
  type: 'text' | 'boolean' | 'number' | 'select';
  options?: string[];
  description: string;
}

export default function SystemSettings() {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchSettings = async () => {
      setLoading(true);
      
      // Mock settings data
      const mockSettings: SystemSetting[] = [
        {
          id: '1',
          category: 'general',
          name: 'System Name',
          key: 'system_name',
          value: 'AnimalCare+',
          type: 'text',
          description: 'The name of the system displayed to users'
        },
        {
          id: '2',
          category: 'general',
          name: 'Contact Email',
          key: 'contact_email',
          value: 'support@animalcare.com',
          type: 'text',
          description: 'Email address for support inquiries'
        },
        {
          id: '3',
          category: 'general',
          name: 'Enable Registration',
          key: 'enable_registration',
          value: true,
          type: 'boolean',
          description: 'Allow new users to register on the platform'
        },
        {
          id: '4',
          category: 'security',
          name: 'Session Timeout (minutes)',
          key: 'session_timeout',
          value: 60,
          type: 'number',
          description: 'Time in minutes before inactive users are logged out'
        },
        {
          id: '5',
          category: 'security',
          name: 'Require Strong Passwords',
          key: 'require_strong_passwords',
          value: true,
          type: 'boolean',
          description: 'Enforce password complexity requirements'
        },
        {
          id: '6',
          category: 'notification',
          name: 'Email Notifications',
          key: 'email_notifications',
          value: true,
          type: 'boolean',
          description: 'Send email notifications to users'
        },
        {
          id: '7',
          category: 'notification',
          name: 'Notification Frequency',
          key: 'notification_frequency',
          value: 'daily',
          type: 'select',
          options: ['realtime', 'hourly', 'daily', 'weekly'],
          description: 'How often to send digest notifications'
        },
        {
          id: '8',
          category: 'ai',
          name: 'AI Model',
          key: 'ai_model',
          value: 'yolo-v4',
          type: 'select',
          options: ['yolo-v3', 'yolo-v4', 'efficientnet', 'mobilenet'],
          description: 'AI model used for animal detection'
        },
        {
          id: '9',
          category: 'ai',
          name: 'Detection Confidence Threshold',
          key: 'confidence_threshold',
          value: 0.7,
          type: 'number',
          description: 'Minimum confidence score for animal detection (0-1)'
        }
      ];
      
      setSettings(mockSettings);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (id: string, newValue: string | boolean | number) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // In a real app, this would be an API call to save all settings
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setIsSaving(false);
  };

  const filteredSettings = settings.filter(setting => setting.category === activeCategory);

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id={`toggle-${setting.id}`}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
            />
            <label
              htmlFor={`toggle-${setting.id}`}
              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
            ></label>
            <style jsx>{`
              .toggle-checkbox:checked {
                right: 0;
                border-color: #68D391;
              }
              .toggle-checkbox:checked + .toggle-label {
                background-color: #68D391;
              }
            `}</style>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            id={`setting-${setting.id}`}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={setting.value as number}
            step={setting.key === 'confidence_threshold' ? '0.1' : '1'}
            min={setting.key === 'confidence_threshold' ? '0' : undefined}
            max={setting.key === 'confidence_threshold' ? '1' : undefined}
            onChange={(e) => handleSettingChange(setting.id, parseFloat(e.target.value))}
          />
        );
      case 'select':
        return (
          <select
            id={`setting-${setting.id}`}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            id={`setting-${setting.id}`}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">System Settings</h2>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveCategory('general')}
            className={`${
              activeCategory === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            General
          </button>
          <button
            onClick={() => setActiveCategory('security')}
            className={`${
              activeCategory === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveCategory('notification')}
            className={`${
              activeCategory === 'notification'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveCategory('ai')}
            className={`${
              activeCategory === 'ai'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            AI Settings
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSettings.map(setting => (
            <div key={setting.id} className="flex flex-col sm:flex-row sm:items-start py-4 border-b border-gray-200 last:border-b-0">
              <div className="sm:w-1/3">
                <label htmlFor={`setting-${setting.id}`} className="block text-sm font-medium text-gray-700">
                  {setting.name}
                </label>
                <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
              </div>
              <div className="mt-2 sm:mt-0 sm:w-2/3">
                {renderSettingInput(setting)}
              </div>
            </div>
          ))}

          <div className="pt-5 flex justify-end">
            {saveSuccess && (
              <div className="mr-4 text-sm text-green-600 flex items-center">
                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Settings saved successfully
              </div>
            )}
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 