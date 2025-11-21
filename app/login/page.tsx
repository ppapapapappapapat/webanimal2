'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../components/Login';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const { isAuthenticated, user, isLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect after authentication check is complete
    if (!isLoading && isAuthenticated && user) {
      // Redirect to HOME instead of profile
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router, user]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        {/* REMOVED: <Navigation /> */}
        <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }
  
  // Only show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {/* REMOVED: <Navigation /> */}
        <div className="py-6">
          <Login />
        </div>
      </>
    );
  }
  
  // This shouldn't be visible, but handling just in case
  return null;
}