'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AnimalDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      // Redirect to the working animal details page
      router.push(`/pages/animals/${id}`);
    }
  }, [router, id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to animal details...</p>
      </div>
    </div>
  );
}
