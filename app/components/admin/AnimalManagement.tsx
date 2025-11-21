'use client';

import React, { useState, useEffect } from 'react';
import { Animal, Database } from '../../database/database';

export default function AnimalManagement() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    color: '',
    weight: '',
    userId: '',
    status: 'healthy' as 'healthy' | 'sick' | 'recovering' | 'unknown',
    medicalHistory: '',
  });
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch animals
        const allAnimals = await Database.getAnimals();
        setAnimals(allAnimals);
        
        // Fetch users for the dropdown
        const users = await Database.getAllUsers();
        setUserOptions(users.map(user => ({ id: user.id, name: user.name })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed || '',
      age: animal.age?.toString() || '',
      color: animal.color || '',
      weight: animal.weight?.toString() || '',
      userId: animal.userId,
      status: animal.status,
      medicalHistory: animal.medicalHistory?.join(', ') || '',
    });
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleAddNewAnimal = () => {
    setSelectedAnimal(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      color: '',
      weight: '',
      userId: userOptions.length > 0 ? userOptions[0].id : '',
      status: 'healthy',
      medicalHistory: '',
    });
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteAnimal = async (animalId: string) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        // In a real app, this would be an API call
        await Database.deleteAnimal(animalId);
        setAnimals(animals.filter(animal => animal.id !== animalId));
      } catch (error) {
        console.error('Error deleting animal:', error);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const animalData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        color: formData.color || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        userId: formData.userId,
        status: formData.status,
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(item => item.trim()) : undefined,
      };

      if (editMode && selectedAnimal) {
        // Update existing animal
        const updatedAnimal = await Database.updateAnimal(selectedAnimal.id, animalData);
        setAnimals(animals.map(animal => animal.id === selectedAnimal.id ? updatedAnimal : animal));
      } else {
        // Create new animal
        const newAnimal = await Database.addAnimal(animalData);
        setAnimals([...animals, newAnimal]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving animal:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Animal Management</h2>
        <button
          onClick={handleAddNewAnimal}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add New Animal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Animal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Species
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden">
                        {animal.imageUrl ? (
                          <img src={animal.imageUrl} alt={animal.name} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-green-100 text-green-600">
                            {animal.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{animal.name}</div>
                        {animal.breed && (
                          <div className="text-sm text-gray-500">{animal.breed}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {animal.species}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userOptions.find(u => u.id === animal.userId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${animal.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                        animal.status === 'sick' ? 'bg-red-100 text-red-800' : 
                        animal.status === 'recovering' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {animal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditAnimal(animal)}
                      className="text-blue-600 hover:text-blue-900 mr-4 focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAnimal(animal.id)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Animal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editMode ? 'Edit Animal' : 'Add New Animal'}
              </h3>
              <form className="mt-4 text-left" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="species">
                    Species
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="species"
                    type="text"
                    name="species"
                    value={formData.species}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="breed">
                    Breed
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="breed"
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
                      Age
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="age"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
                      Weight (kg)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="weight"
                      type="number"
                      name="weight"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
                    Color
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="color"
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
                    Owner
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleFormChange}
                    required
                  >
                    {userOptions.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                    Health Status
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick</option>
                    <option value="recovering">Recovering</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="medicalHistory">
                    Medical History (comma separated)
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={3}
                    value={formData.medicalHistory}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {editMode ? 'Update Animal' : 'Create Animal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 