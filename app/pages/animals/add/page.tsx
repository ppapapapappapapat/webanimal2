'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import { Animal, Database } from '../../../database/database';
import { useUser } from '../../../context/UserContext';
import ImageUpload from '../../../components/ImageUpload';

export default function AddAnimalPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  type AnimalStatus = 'healthy' | 'sick' | 'recovering' | 'unknown';
  const [formData, setFormData] = useState<{
    name: string;
    species: string;
    breed: string;
    age: string;
    color: string;
    weight: string;
    status: AnimalStatus;
    lastCheckup: string;
    medicalHistory: string;
    imageUrl: string;
  }>({
    name: '',
    species: '',
    breed: '',
    age: '',
    color: '',
    weight: '',
    status: 'healthy',
    lastCheckup: '',
    medicalHistory: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add an animal.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        // In a real app, you would upload the file to a storage service
        // For now, we'll use the data URL directly
        finalImageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
      
      const animalData: Partial<Animal> = {
        ...formData,
        userId: user.id,
        age: parseInt(formData.age) || 0,
        weight: parseFloat(formData.weight) || 0,
        imageUrl: finalImageUrl,
        createdAt: new Date(),
        medicalHistory: formData.medicalHistory.split(',').map(item => item.trim()),
        lastCheckup: formData.lastCheckup ? new Date(formData.lastCheckup) : undefined,
        status: formData.status
      };
      
      await Database.createAnimal(animalData);
      router.push('/profile');
    } catch (error) {
      console.error('Error adding animal:', error);
      setError('Failed to add animal. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (_file: File, previewUrl: string) => {
    setImageFile(_file);
    setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-4">You need to be logged in to add an animal.</p>
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
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => router.push('/pages/animals')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Animal</h1>
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
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
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
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
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
                    name="age"
                    min="0"
                    step="0.1"
                    value={formData.age}
                    onChange={handleChange}
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
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
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
                    name="weight"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
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
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
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
                    name="lastCheckup"
                    value={formData.lastCheckup}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Animal Image
                  </label>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    defaultImageUrl={formData.imageUrl}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/pages/animals')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                    Adding...
                  </>
                ) : 'Add Animal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 