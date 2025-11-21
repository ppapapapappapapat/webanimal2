'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddAnimalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the working add animal page
    router.push('/pages/animals/add');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to add animal page...</p>
      </div>
    </div>
  );
}
