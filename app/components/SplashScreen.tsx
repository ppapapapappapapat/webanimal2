'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use useEffect for the timer to properly clean up
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Redirect to the main page after loading is complete
      router.push('/');
    }, 2500); // Increased timeout to 2.5 seconds
    
    // Clean up the timer on unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-400 to-green-600 z-50 overflow-hidden">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-bounce">
          PawthCare
        </h1>
        <p className="text-xl text-white opacity-90 animate-pulse">
          The path to better animal health and awareness.
        </p>
      </div>
      
      {loading && (
        <div className="mt-12">
          <div className="w-32 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden mt-8 animate-fade-in">
            <div className="h-full bg-white animate-loading-bar"></div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-8 text-white text-sm opacity-60 animate-fade-in-delayed">
        <p>© 2025 Wildlife Guardian</p>
      </div>
    </div>
  );
} 