'use client';

import React, { useState, useEffect } from 'react';
import { Animal, Database } from '../database/database';
import { useUser } from '../context/UserContext';
import Image from 'next/image';
import Link from 'next/link';

export default function AnimalHealthDashboard() {
  const { user, isAuthenticated } = useUser();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'healthy' | 'sick' | 'recovering'>('all');
  const [treatmentNotes, setTreatmentNotes] = useState<Record<string, string>>({});
  const [treatmentDate, setTreatmentDate] = useState<Record<string, string>>({});
  const [savingTreatment, setSavingTreatment] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [treatmentSuccess, setTreatmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const allAnimals = await Database.getAnimals();
      setAnimals(allAnimals);
      
      // Initialize treatment notes for all animals
      const notesObj: Record<string, string> = {};
      const dateObj: Record<string, string> = {};
      allAnimals.forEach(animal => {
        notesObj[animal.id] = '';
        dateObj[animal.id] = new Date().toISOString().split('T')[0];
      });
      setTreatmentNotes(notesObj);
      setTreatmentDate(dateObj);
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTreatmentSubmit = async (animalId: string) => {
    if (!treatmentNotes[animalId]) {
      setErrors({...errors, [animalId]: 'Treatment notes are required'});
      return;
    }

    try {
      setSavingTreatment({...savingTreatment, [animalId]: true});
      setErrors({...errors, [animalId]: ''});
      
      // Get the animal data
      const animal = animals.find(a => a.id === animalId);
      if (!animal) return;
      
      // Add treatment to medical history
      const updatedHistory = [
        ...(animal.medicalHistory || []),
        `[${treatmentDate[animalId]}] Treatment: ${treatmentNotes[animalId]}`
      ];
      
      // Update animal status based on current status
      let updatedStatus = animal.status;
      if (animal.status === 'sick') {
        updatedStatus = 'recovering';
      } else if (animal.status === 'recovering') {
        const randomChance = Math.random();
        updatedStatus = randomChance > 0.3 ? 'healthy' : 'recovering';
      }
      
      // Update the animal
      const updatedAnimal = await Database.updateAnimal(animalId, {
        status: updatedStatus,
        medicalHistory: updatedHistory
      });
      
      if (updatedAnimal) {
        // Update the local animals array
        setAnimals(animals.map(a => a.id === animalId ? updatedAnimal : a));
        
        // Reset treatment notes for this animal
        setTreatmentNotes({...treatmentNotes, [animalId]: ''});
        
        // Show success message
        setTreatmentSuccess(`Treatment recorded for ${animal.name}. Status updated to ${updatedStatus}.`);
        setTimeout(() => setTreatmentSuccess(null), 5000);
      }
    } catch (error) {
      console.error('Error saving treatment:', error);
      setErrors({...errors, [animalId]: 'Failed to save treatment'});
    } finally {
      setSavingTreatment({...savingTreatment, [animalId]: false});
    }
  };

  const filteredAnimals = activeTab === 'all'
    ? animals
    : animals.filter(animal => animal.status === activeTab);

  const getStatusColor = (status: 'healthy' | 'sick' | 'recovering' | 'unknown') => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'recovering': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCount = (status: 'healthy' | 'sick' | 'recovering' | 'unknown') => {
    return animals.filter(animal => animal.status === status).length;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Animal Health Monitoring</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Animal Health Monitoring</h2>
      <p className="text-gray-600 mb-6">Track and manage animal health and treatments</p>

      {treatmentSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          {treatmentSuccess}
        </div>
      )}

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-md p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('all')}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-sm">All Animals</div>
              <div className="text-2xl font-bold">{animals.length}</div>
            </div>
            <div className="bg-blue-100 text-blue-800 h-10 w-10 rounded-full flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-md p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('healthy')}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-sm">Healthy</div>
              <div className="text-2xl font-bold">{getStatusCount('healthy')}</div>
            </div>
            <div className="bg-green-100 text-green-800 h-10 w-10 rounded-full flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-md p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('sick')}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-sm">Sick</div>
              <div className="text-2xl font-bold">{getStatusCount('sick')}</div>
            </div>
            <div className="bg-red-100 text-red-800 h-10 w-10 rounded-full flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-md p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('recovering')}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-sm">Recovering</div>
              <div className="text-2xl font-bold">{getStatusCount('recovering')}</div>
            </div>
            <div className="bg-yellow-100 text-yellow-800 h-10 w-10 rounded-full flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Animals
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'healthy'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('healthy')}
        >
          Healthy
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'sick'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('sick')}
        >
          Sick
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'recovering'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('recovering')}
        >
          Recovering
        </button>
      </div>

      {/* Animals List */}
      {filteredAnimals.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No animals found with status: {activeTab}</p>
        </div>
      ) : (
        <div>
          {activeTab === 'all' && (
            <>
              {/* Animals Requiring Attention */}
              {animals.filter(animal => animal.status === 'sick' || animal.status === 'recovering').length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <h3 className="text-xl font-bold text-gray-900">Animals Requiring Attention</h3>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                    <p className="text-red-700 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      These animals need treatment or are currently under treatment.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {animals
                      .filter(animal => animal.status === 'sick' || animal.status === 'recovering')
                      .map(animal => renderAnimalCard(animal))}
                  </div>
                </div>
              )}

              {/* Healthy Animals */}
              {animals.filter(animal => animal.status === 'healthy').length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <h3 className="text-xl font-bold text-gray-900">Healthy Animals</h3>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                    <p className="text-green-700 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      These animals are in good health and don't require immediate attention.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {animals
                      .filter(animal => animal.status === 'healthy')
                      .map(animal => renderAnimalCard(animal))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab !== 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAnimals.map(animal => renderAnimalCard(animal))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderAnimalCard(animal: Animal) {
    return (
      <div key={animal.id} className={`border rounded-lg overflow-hidden ${
        animal.status === 'sick' ? 'border-red-300 bg-red-50' : 
        animal.status === 'recovering' ? 'border-yellow-300 bg-yellow-50' : 
        'border-gray-200 bg-white'
      }`}>
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 relative rounded-full overflow-hidden mr-3">
              {animal.imageUrl ? (
                <Image 
                  src={animal.imageUrl}
                  alt={animal.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                  {animal.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <Link 
                href={`/animals/${animal.id}`}
                className="text-lg font-medium text-blue-600 hover:text-blue-800"
              >
                {animal.name}
              </Link>
              <p className="text-sm text-gray-500">
                {animal.species}{animal.breed ? ` • ${animal.breed}` : ''}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(animal.status)}`}>
            {animal.status}
          </span>
        </div>

        <div className="p-4">
          {/* Most recent medical history */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Medical History</h4>
            {animal.medicalHistory && animal.medicalHistory.length > 0 ? (
              <ul className="text-sm text-gray-600 space-y-1 border-l-2 border-gray-200 pl-3">
                {animal.medicalHistory.slice(-3).reverse().map((entry, idx) => (
                  <li key={idx}>{entry}</li>
                ))}
                {animal.medicalHistory.length > 3 && (
                  <li className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    <Link href={`/animals/${animal.id}`}>View full history...</Link>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No medical history recorded</p>
            )}
          </div>

          {/* Treatment form (only shown for sick or recovering animals) */}
          {(animal.status === 'sick' || animal.status === 'recovering') && isAuthenticated && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Record Treatment</h4>
              
              {errors[animal.id] && (
                <div className="bg-red-50 text-red-700 p-2 text-sm rounded mb-2">
                  {errors[animal.id]}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={treatmentDate[animal.id]}
                    onChange={(e) => setTreatmentDate({...treatmentDate, [animal.id]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Treatment Notes</label>
                  <input
                    type="text"
                    value={treatmentNotes[animal.id]}
                    onChange={(e) => setTreatmentNotes({...treatmentNotes, [animal.id]: e.target.value})}
                    placeholder="e.g., Antibiotics administered, temperature checked"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    onClick={() => handleTreatmentSubmit(animal.id)}
                    disabled={savingTreatment[animal.id]}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    {savingTreatment[animal.id] ? 'Saving...' : 'Record Treatment'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
} 