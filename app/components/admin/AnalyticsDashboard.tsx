'use client';

import React, { useState, useEffect } from 'react';

// Mock data for analytics
interface AnalyticsData {
  totalUsers: number;
  newUsersToday: number;
  totalAnimals: number;
  activeDetections: number;
  userStats: {
    date: string;
    count: number;
  }[];
  animalTypeDistribution: {
    type: string;
    count: number;
  }[];
  detectionsByDay: {
    date: string;
    count: number;
  }[];
  topDetectedAnimals: {
    name: string;
    count: number;
  }[];
}

const mockedAnalyticsData: AnalyticsData = {
  totalUsers: 156,
  newUsersToday: 4,
  totalAnimals: 243,
  activeDetections: 89,
  userStats: [
    { date: 'Jun 1', count: 120 },
    { date: 'Jun 8', count: 132 },
    { date: 'Jun 15', count: 141 },
    { date: 'Jun 22', count: 148 },
    { date: 'Jun 29', count: 156 },
  ],
  animalTypeDistribution: [
    { type: 'Dog', count: 94 },
    { type: 'Cat', count: 76 },
    { type: 'Bird', count: 32 },
    { type: 'Horse', count: 18 },
    { type: 'Other', count: 23 },
  ],
  detectionsByDay: [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 15 },
    { date: 'Wed', count: 21 },
    { date: 'Thu', count: 18 },
    { date: 'Fri', count: 14 },
    { date: 'Sat', count: 8 },
    { date: 'Sun', count: 5 },
  ],
  topDetectedAnimals: [
    { name: 'Dog', count: 45 },
    { name: 'Cat', count: 32 },
    { name: 'Bird', count: 14 },
    { name: 'Horse', count: 7 },
    { name: 'Deer', count: 5 },
  ]
};

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would fetch from an API with the selected time range
      setAnalyticsData(mockedAnalyticsData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h2>
        <div className="text-center text-red-500">
          Error loading analytics data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'day'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'week'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'month'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{analyticsData.totalUsers}</p>
              <p className="text-sm text-green-600">+{analyticsData.newUsersToday} today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Animals</p>
              <p className="text-3xl font-bold text-gray-800">{analyticsData.totalAnimals}</p>
              <p className="text-sm text-gray-500">Registered in system</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Detections</p>
              <p className="text-3xl font-bold text-gray-800">{analyticsData.activeDetections}</p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Detections</p>
              <p className="text-3xl font-bold text-gray-800">
                {Math.round(analyticsData.detectionsByDay.reduce((sum, day) => sum + day.count, 0) / 7)}
              </p>
              <p className="text-sm text-gray-500">Per day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">User Growth</h3>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.userStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(stat.count / Math.max(...analyticsData.userStats.map(s => s.count))) * 180}px`,
                  }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">{stat.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animal Type Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Animal Type Distribution</h3>
          <div className="h-64">
            <div className="h-full flex flex-col justify-center">
              {analyticsData.animalTypeDistribution.map((item, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                    <span className="text-sm font-medium text-gray-700">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        index % 4 === 0 ? 'bg-blue-600' : 
                        index % 4 === 1 ? 'bg-green-600' : 
                        index % 4 === 2 ? 'bg-yellow-600' : 
                        'bg-purple-600'
                      }`}
                      style={{
                        width: `${(item.count / Math.max(...analyticsData.animalTypeDistribution.map(i => i.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detections by Day */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Detections by Day</h3>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.detectionsByDay.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-purple-500 rounded-t"
                  style={{
                    height: `${(day.count / Math.max(...analyticsData.detectionsByDay.map(d => d.count))) * 180}px`,
                  }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">{day.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Detected Animals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Detected Animals</h3>
          <div className="overflow-y-auto h-64">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.topDetectedAnimals.map((animal, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {animal.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {animal.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index % 4 === 0 ? 'bg-blue-600' : 
                            index % 4 === 1 ? 'bg-green-600' : 
                            index % 4 === 2 ? 'bg-yellow-600' : 
                            'bg-purple-600'
                          }`}
                          style={{
                            width: `${(animal.count / Math.max(...analyticsData.topDetectedAnimals.map(a => a.count))) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 