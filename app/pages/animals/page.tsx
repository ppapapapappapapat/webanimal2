'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { Animal, Database } from '../../database/database';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';

export default function AnimalsPage() {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const allAnimals = await Database.getAnimals();
        setAnimals(allAnimals);
      } catch (error) {
        console.error('Error fetching animals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const getStatusColor = (status: 'healthy' | 'sick' | 'recovering' | 'unknown') => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'recovering': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-4">You need to be logged in to view this page.</p>
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
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Animals</h1>
          {isAuthenticated && (
            <button 
              onClick={() => router.push('/pages/animals/add')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Animal
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : animals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Animals Found</h2>
            <p className="text-gray-600 mb-6">There are no animals in the database yet.</p>
            <button 
              onClick={() => router.push('/pages/animals/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Your First Animal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map(animal => (
              <div key={animal.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 w-full relative bg-gray-200">
                  {animal.imageUrl ? (
                    <Image
                      src={animal.imageUrl}
                      alt={animal.name}
                      fill
                      style={{objectFit: 'cover'}}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{animal.name}</h2>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(animal.status)}`}>
                      {animal.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {animal.species}{animal.breed ? ` • ${animal.breed}` : ''}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    {animal.age && (
                      <div>
                        <span className="text-gray-500">Age:</span> {animal.age} years
                      </div>
                    )}
                    {animal.weight && (
                      <div>
                        <span className="text-gray-500">Weight:</span> {animal.weight} kg
                      </div>
                    )}
                    {animal.lastCheckup && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Last Checkup:</span> {new Date(animal.lastCheckup).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/pages/animals/${animal.id}`}
                    className="w-full block text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 