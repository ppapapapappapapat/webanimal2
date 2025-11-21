'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '../../../context/UserContext';
import { Database } from '../../../database/database';
import type { Animal } from '../../../database/database';

export default function AdminAnimalsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchAnimals = async () => {
      try {
        const allAnimals = await Database.getAnimals();
        setAnimals(allAnimals);
      } catch (error) {
        console.error('Error fetching animals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimals();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Animals</h1>
        <button
          onClick={() => router.push('/pages/animals/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Animal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={animal.imageUrl || '/placeholder-animal.jpg'}
                alt={animal.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900">{animal.name}</h2>
              <p className="text-gray-600">{animal.species} {animal.breed ? `(${animal.breed})` : ''}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  animal.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  animal.status === 'sick' ? 'bg-red-100 text-red-800' :
                  animal.status === 'recovering' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
                </span>
                <button
                  onClick={() => router.push(`/pages/animals/${animal.id}`)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Owner ID: {animal.userId}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 