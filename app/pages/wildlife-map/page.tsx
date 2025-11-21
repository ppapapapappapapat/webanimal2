'use client';

import React from 'react';
// REMOVED: import Navigation from '../../components/Navigation';
import GlobalWildlifeTracker from '../../components/GlobalWildlifeTracker';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';

export default function WildlifeMapPage() {
  const { isAuthenticated } = useUser();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* REMOVED: <Navigation /> */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-4">You need to be logged in to view the wildlife tracking map.</p>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* REMOVED: <Navigation /> */}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Wildlife Tracking Map</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push('/animals')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View All Animals
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            This map shows the locations where animals have been detected. Each marker represents a detection event.
            Click on a marker to see details about the animal and the detection.
          </p>
          
          {/* Warning note about the demo data */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">Note</h3>
                <p className="text-yellow-700 text-sm">
                  For demonstration purposes, this map shows simulated animal detection data. In a production environment, 
                  this would display real-time data from GPS trackers, camera traps, and field observations.
                </p>
              </div>
            </div>
          </div>
          
          {/* The actual map component */}
          <div className="map-wrapper" style={{ height: '70vh' }}>
            <GlobalWildlifeTracker />
          </div>
        </div>
      </div>
    </main>
  );
}