'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { Database } from '../database/database';
import { Animal, DetectionReport } from '../database/database';

export default function ProfilePage() {
  const { user, isAuthenticated, login, logout, updateUserProfile } = useUser();
  const router = useRouter();
  const [userAnimals, setUserAnimals] = useState<Animal[]>([]);
  const [userDetections, setUserDetections] = useState<DetectionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    profileImage: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Initialize form with user data
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || ''
      });
    }

    // Load user's animals and detections (keeping for potential future use)
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const allAnimals = await Database.getAnimals();
          const userAnimals = allAnimals.filter(animal => animal.userId === user.id);
          const detections = await Database.getDetectionReports(user.id);
          
          setUserAnimals(userAnimals);
          setUserDetections(detections);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await updateUserProfile({
          ...user,
          name: profileForm.name,
          email: profileForm.email,
          profileImage: profileForm.profileImage
        });
        // Show success message
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative h-24 w-24 md:h-32 md:w-32">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  className="rounded-full border-4 border-white"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded-full bg-gray-200 border-4 border-white h-full w-full flex items-center justify-center">
                  <span className="text-3xl text-gray-500">{user.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="text-white text-center md:text-left">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="font-medium">{user.email}</p>
              <p className="text-blue-100 capitalize">
                {user.role === 'admin' ? 'Admin' : 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* REMOVED: Tab navigation for Animals and Detections */}
        
        <div className="p-6">
          {/* Only show Profile section now */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="profileImage"
                  value={profileForm.profileImage}
                  onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Log Out
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}