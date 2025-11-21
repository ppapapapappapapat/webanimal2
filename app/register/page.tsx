'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Register from '../components/Register';
import { useUser } from '../context/UserContext';

export default function RegisterPage() {
  const { isAuthenticated, user, isLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect after authentication check is complete
    if (!isLoading && isAuthenticated && user) {
      // Redirect to HOME if already logged in
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, user]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Only show register form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="py-6">
        <Register />
      </div>
    );
  }
  
  // This shouldn't be visible, but handling just in case
  return null;
}