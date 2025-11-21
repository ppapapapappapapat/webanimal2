'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '../../../../components/Navigation';
import { Animal, Database } from '../../../../database/database';
import { useUser } from '../../../../context/UserContext';

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState<number | undefined>();
  const [status, setStatus] = useState<'healthy' | 'sick' | 'recovering' | 'unknown'>('healthy');
  const [lastCheckup, setLastCheckup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
        
        // Populate form fields
        setName(animalData.name);
        setSpecies(animalData.species);
        setBreed(animalData.breed || '');
        setAge(animalData.age);
        setColor(animalData.color || '');
        setWeight(animalData.weight);
        setStatus(animalData.status);
        setLastCheckup(animalData.lastCheckup ? new Date(animalData.lastCheckup).toISOString().split('T')[0] : '');
        setMedicalHistory(animalData.medicalHistory || '');
        setImageUrl(animalData.imageUrl || '');
      } catch (error) {
        console.error('Error fetching animal data:', error);
        setError('Failed to load animal information');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animal) return;
    
    try {
      setSaving(true);
      
      // Prepare updated animal data
      const updatedAnimal: Animal = {
        ...animal,
        name,
        species,
        breed: breed || undefined,
        age,
        color: color || undefined,
        weight,
        status,
        lastCheckup: lastCheckup ? new Date(lastCheckup).toISOString() : undefined,
        medicalHistory: medicalHistory || undefined,
        imageUrl: imageUrl || undefined,
      };
      
      await Database.updateAnimal(updatedAnimal);
      router.push(`/pages/animals/${animal.id}`);
    } catch (error) {
      console.error('Error updating animal:', error);
      setError('Failed to update animal information');
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-4">You need to be logged in to edit animal information.</p>
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
            onClick={() => router.push(`/pages/animals/${animal.id}`)}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit {animal.name}</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
                    Species <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="species"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    id="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    id="age"
                    min="0"
                    step="0.1"
                    value={age === undefined ? '' : age}
                    onChange={(e) => setAge(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    step="0.1"
                    value={weight === undefined ? '' : weight}
                    onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Health Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Health Information</h2>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Health Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'healthy' | 'sick' | 'recovering' | 'unknown')}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick</option>
                    <option value="recovering">Recovering</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="lastCheckup" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Checkup Date
                  </label>
                  <input
                    type="date"
                    id="lastCheckup"
                    value={lastCheckup}
                    onChange={(e) => setLastCheckup(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Preview:</p>
                      <div className="h-32 w-32 relative border border-gray-300 rounded overflow-hidden">
                        <img 
                          src={imageUrl}
                          alt="Animal preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/pages/animals/${animal.id}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 