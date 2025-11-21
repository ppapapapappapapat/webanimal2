'use client';

import React, { useState, useEffect } from 'react';
import { Database } from '../../database/database';
import Link from 'next/link';
import Image from 'next/image';

// Define types
type EndangeredSpeciesData = {
  id: string;
  name: string;
  scientificName: string;
  status: 'Critically Endangered' | 'Endangered' | 'Vulnerable';
  population: string;
  habitat: string;
  conservation: string;
  detectionCount: number;
  lastDetected: Date | null;
  imageUrl: string;
};

type DetectionData = {
  id: string;
  species: string;
  location: string;
  timestamp: Date;
  confidence: number;
  userId: string;
  userName: string;
};

export default function EndangeredSpeciesAdmin() {
  const [species, setSpecies] = useState<EndangeredSpeciesData[]>([]);
  const [detections, setDetections] = useState<DetectionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState({
    totalSpecies: 0,
    criticallyEndangered: 0,
    totalDetections: 0,
    activeUsers: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // In a real app, this would come from API calls to your backend
        // For this mock, we'll simulate data
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock endangered species data
        const mockSpecies: EndangeredSpeciesData[] = [
          {
            id: 'es_001',
            name: 'Amur Leopard',
            scientificName: 'Panthera pardus orientalis',
            status: 'Critically Endangered',
            population: 'Less than 100',
            habitat: 'Temperate forests',
            conservation: 'Habitat protection, anti-poaching patrols',
            detectionCount: 12,
            lastDetected: new Date('2025-11-15'),
            imageUrl: '/images/endangered/Amur leopard.jpg'
          },
          {
            id: 'es_002',
            name: 'Javan Rhino',
            scientificName: 'Rhinoceros sondaicus',
            status: 'Critically Endangered',
            population: 'Less than 80',
            habitat: 'Tropical rainforests',
            conservation: 'Protected areas, conservation breeding',
            detectionCount: 5,
            lastDetected: new Date('2025-12-03'),
            imageUrl: '/images/endangered/Javan Rhino.jpg'
          },
          {
            id: 'es_003',
            name: 'Sumatran Orangutan',
            scientificName: 'Pongo abelii',
            status: 'Critically Endangered',
            population: 'About 14,000',
            habitat: 'Tropical rainforests',
            conservation: 'Habitat restoration, anti-poaching measures',
            detectionCount: 24,
            lastDetected: new Date('2025-12-18'),
            imageUrl: '/images/endangered/Orangutan.jpg'
          },
          {
            id: 'es_004',
            name: 'Vaquita',
            scientificName: 'Phocoena sinus',
            status: 'Critically Endangered',
            population: 'Less than 10',
            habitat: 'Marine coastal waters',
            conservation: 'Fishing restrictions, protected zones',
            detectionCount: 0,
            lastDetected: null,
            imageUrl: '/images/endangered/Vaquita.jpeg'
          },
          {
            id: 'es_005',
            name: 'Mountain Gorilla',
            scientificName: 'Gorilla beringei beringei',
            status: 'Endangered',
            population: 'About 1,000',
            habitat: 'Mountain forests',
            conservation: 'Ecotourism, anti-poaching efforts',
            detectionCount: 18,
            lastDetected: new Date('2025-12-10'),
            imageUrl: '/images/endangered/Mountain Gorilla.jpg'
          },
          {
            id: 'es_006',
            name: 'Giant Panda',
            scientificName: 'Ailuropoda melanoleuca',
            status: 'Vulnerable',
            population: 'About 1,800',
            habitat: 'Bamboo forests',
            conservation: 'Protected reserves, breeding programs',
            detectionCount: 31,
            lastDetected: new Date('2025-12-20'),
            imageUrl: '/images/endangered/Giant Panda.jpg'
          }
        ];
        
        // Mock detection data
        const mockDetections: DetectionData[] = [
          { 
            id: 'det_001', 
            species: 'Amur Leopard', 
            location: 'Sikhote-Alin Mountains', 
            timestamp: new Date('2025-12-18T14:32:00'), 
            confidence: 0.89, 
            userId: 'user_001',
            userName: 'Sarah Researcher'
          },
          { 
            id: 'det_002', 
            species: 'Mountain Gorilla', 
            location: 'Virunga Mountains', 
            timestamp: new Date('2025-12-10T09:15:00'), 
            confidence: 0.94, 
            userId: 'user_002',
            userName: 'Michael Conservationist'
          },
          { 
            id: 'det_003', 
            species: 'Giant Panda', 
            location: 'Wolong Nature Reserve', 
            timestamp: new Date('2025-12-20T11:45:00'), 
            confidence: 0.97, 
            userId: 'user_003',
            userName: 'Ling Park Ranger'
          },
          { 
            id: 'det_004', 
            species: 'Sumatran Orangutan', 
            location: 'Gunung Leuser National Park', 
            timestamp: new Date('2025-12-18T16:22:00'), 
            confidence: 0.91, 
            userId: 'user_004',
            userName: 'David Field Worker'
          },
          { 
            id: 'det_005', 
            species: 'Amur Leopard', 
            location: 'Land of the Leopard National Park', 
            timestamp: new Date('2025-12-15T07:58:00'), 
            confidence: 0.86, 
            userId: 'user_001',
            userName: 'Sarah Researcher'
          },
        ];
        
        // Calculate stats
        const stats = {
          totalSpecies: mockSpecies.length,
          criticallyEndangered: mockSpecies.filter(s => s.status === 'Critically Endangered').length,
          totalDetections: mockSpecies.reduce((sum, species) => sum + species.detectionCount, 0),
          activeUsers: new Set(mockDetections.map(d => d.userId)).size
        };
        
        setSpecies(mockSpecies);
        setDetections(mockDetections);
        setStats(stats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching endangered species data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter detections based on selected species
  const filteredDetections = selectedSpecies
    ? detections.filter(detection => detection.species === selectedSpecies)
    : detections;

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status color
  const getStatusColor = (status: 'Critically Endangered' | 'Endangered' | 'Vulnerable') => {
    switch (status) {
      case 'Critically Endangered': return 'bg-red-100 text-red-800';
      case 'Endangered': return 'bg-orange-100 text-orange-800';
      case 'Vulnerable': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Endangered Species Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Endangered Species Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor and manage endangered species data and detections</p>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Species</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSpecies}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Critically Endangered</p>
              <p className="text-2xl font-bold text-gray-800">{stats.criticallyEndangered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Detections</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalDetections}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Species List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-medium">Endangered Species</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detections</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Detected</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {species.map((animal) => (
                    <tr 
                      key={animal.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedSpecies === animal.name ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedSpecies(selectedSpecies === animal.name ? null : animal.name)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden relative">
                            <Image 
                              src={animal.imageUrl} 
                              alt={animal.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{animal.name}</div>
                            <div className="text-sm text-gray-500 italic">{animal.scientificName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(animal.status)}`}>
                          {animal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {animal.detectionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(animal.lastDetected)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Recent Detections */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {selectedSpecies ? `${selectedSpecies} Detections` : 'Recent Detections'}
              </h2>
              {selectedSpecies && (
                <button 
                  onClick={() => setSelectedSpecies(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              )}
            </div>
            <div className="p-5 space-y-4">
              {filteredDetections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No detections found
                </div>
              ) : (
                filteredDetections.map(detection => (
                  <div key={detection.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{detection.species}</div>
                        <div className="text-xs text-gray-500">
                          {detection.location} • Confidence: {(detection.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(detection.timestamp)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Reported by: {detection.userName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 