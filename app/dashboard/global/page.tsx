'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import GlobalWildlifeTracker from '@/app/components/GlobalWildlifeTracker';

export default function GlobalTrackerPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Only render the tracker if user is authenticated
  return user ? (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-green-800">Global Wildlife Tracker</h1>
      <GlobalWildlifeTracker />
    </div>
  ) : null;
} 