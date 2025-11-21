'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navigation from '../../../components/Navigation';
import { Animal, Database, Detection } from '../../../database/database';
import { useUser } from '../../../context/UserContext';

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lifespanPrediction, setLifespanPrediction] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const fetchAnimalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!params.id) {
          setError('Animal ID not provided');
          setLoading(false);
          return;
        }
        
        const animalId = Array.isArray(params.id) ? params.id[0] : params.id;
        const animalData = await Database.getAnimalById(animalId);
        
        if (!animalData) {
          setError('Animal not found');
          setLoading(false);
          return;
        }
        
        setAnimal(animalData);
        
        // Fetch detections for this animal
        const animalDetections = await Database.getDetectionsByAnimalId(animalId);
        setDetections(animalDetections);
      } catch (error) {
        console.error('Error fetching animal data:', error);
        setError('Failed to load animal information');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!animal) return;
    
    try {
      await Database.deleteAnimal(animal.id);
      router.push('/pages/animals');
    } catch (error) {
      console.error('Error deleting animal:', error);
      setError('Failed to delete animal');
    }
  };

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !animal) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="mb-4">{error || 'Failed to load animal information'}</p>
            <button 
              onClick={() => router.push('/pages/animals')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Animals
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
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => router.push('/pages/animals')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex-grow">{animal.name}</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push(`/pages/animals/edit/${animal.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Animal info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-64 w-full relative bg-gray-200">
                {animal.imageUrl ? (
                  <Image
                    src={animal.imageUrl}
                    alt={animal.name}
                    fill
                    style={{objectFit: 'cover'}}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">{animal.name}</h2>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(animal.status)}`}>
                    {animal.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-3">
                    <span className="text-gray-600 font-medium col-span-1">Species:</span>
                    <span className="col-span-2">{animal.species}</span>
                  </div>
                  
                  {animal.breed && (
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600 font-medium col-span-1">Breed:</span>
                      <span className="col-span-2">{animal.breed}</span>
                    </div>
                  )}
                  
                  {animal.age && (
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600 font-medium col-span-1">Age:</span>
                      <span className="col-span-2">{animal.age} years</span>
                    </div>
                  )}
                  
                  {animal.color && (
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600 font-medium col-span-1">Color:</span>
                      <span className="col-span-2">{animal.color}</span>
                    </div>
                  )}
                  
                  {animal.weight && (
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600 font-medium col-span-1">Weight:</span>
                      <span className="col-span-2">{animal.weight} kg</span>
                    </div>
                  )}
                  
                  {animal.lastCheckup && (
                    <div className="grid grid-cols-3">
                      <span className="text-gray-600 font-medium col-span-1">Last Checkup:</span>
                      <span className="col-span-2">{new Date(animal.lastCheckup).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3">
                    <span className="text-gray-600 font-medium col-span-1">Added:</span>
                    <span className="col-span-2">{new Date(animal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {animal.medicalHistory && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Medical History</h3>
                    <p className="text-gray-700 whitespace-pre-line">{animal.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Detection history */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Pet Lifespan Prediction</h2>
              
              {detections.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-600">Get an estimate of your pet's lifespan based on their characteristics</p>
                  <button 
                    onClick={async () => {
                      setPredicting(true);
                      // Simple mock prediction logic based on animal data
                      let baseLifespan = animal.species === 'dog' ? 12 : animal.species === 'cat' ? 15 : 10;
                      if (animal.breed && ['labrador', 'golden retriever', 'beagle'].includes(animal.breed.toLowerCase())) baseLifespan += 2;
                      if (animal.breed && ['great dane', 'bernese mountain dog', 'rottweiler'].includes(animal.breed.toLowerCase())) baseLifespan -= 2;
                      if (animal.breed && ['siamese', 'burmese'].includes(animal.breed.toLowerCase())) baseLifespan += 3;
                      if (animal.status === 'sick') baseLifespan -= 2;
                      const minLifespan = Math.max(baseLifespan - 2, 1);
                      const maxLifespan = baseLifespan + 2;
                      await new Promise(res => setTimeout(res, 1200));
                      setLifespanPrediction(`${minLifespan}-${maxLifespan} years`);
                      setPredicting(false);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={predicting}
                  >
                    {predicting ? 'Predicting...' : "Predict Pet's Lifespan"}
                  </button>
                  {lifespanPrediction && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md animate-fade-in">
                      <h3 className="text-lg font-medium text-green-800">Prediction Result</h3>
                      <p className="mt-2 text-green-700">
                        Your pet's estimated lifespan is <span className="font-bold animate-pulse-once">{lifespanPrediction}</span>.
                      </p>
                      <p className="mt-1 text-sm text-green-600">
                        This is a general estimate based on your pet's data. Regular veterinary care and a healthy lifestyle can help your pet live longer.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Confidence</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detections.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((detection) => (
                        <tr key={detection.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{new Date(detection.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">
                            {detection.location?.latitude && detection.location?.longitude ? (
                              <>
                                <span className="font-medium">Lat:</span> {detection.location.latitude.toFixed(4)}, <span className="font-medium">Long:</span> {detection.location.longitude.toFixed(4)}
                              </>
                            ) : 'No location data'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {detection.detections[0].score}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button 
                              onClick={() => router.push(`/detections/${detection.id}`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Animal</h3>
            <p className="mb-6">Are you sure you want to delete {animal.name}? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 