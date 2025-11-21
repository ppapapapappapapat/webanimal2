'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplashScreen from './components/SplashScreen';
import { useUser } from './context/UserContext';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Handle splash screen dismissal
    const timer = setTimeout(() => {
      setShowSplash(false);
      
      // If not authenticated, redirect to login page
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Authenticated user, show content
  return (
    <main 
      className="min-h-screen relative overflow-x-hidden"
      style={{
        backgroundImage: "url('/happy-pets.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* REMOVED: <Navigation /> */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with background image */}
        <section
          className="py-12 md:py-20 text-center relative flex flex-col items-center justify-center"
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-white bg-opacity-40 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
              Web-Based Intelligent System for <span className="text-blue-600">Animal Health Prediction</span> and <span className="text-green-600">Endangered Species Awareness</span> Using Machine Learning
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              A comprehensive platform for pet owners and wildlife enthusiasts, 
              combining animal health analytics with conservation awareness.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/pet-lifespan" className="btn-primary">Predict Pet Lifespan</Link>
              <Link href="/animal-diagnosis" className="btn-primary">Diagnose Animal Health</Link>
              <Link href="/animal-detection" className="btn-secondary">Detect Animals</Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          className="py-12 md:py-16 my-8 relative"
          style={{
            borderRadius: '1.5rem',
            overflow: 'hidden',
            backgroundColor: 'transparent', // Make the background transparent
          }}
        >
          
          <div className="absolute inset-0 bg-white bg-opacity-0"></div> {/* Remove the white overlay */}
          <div className="relative z-10 container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-white animate-slide-in-top">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="animate-slide-in-left staggered-item">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold transition-all duration-300 hover:scale-110">1</div>
                <div className="bg-white p-4 rounded-lg shadow-md bg-opacity-40 backdrop-blur-sm">
                  <h3 className="text-2xl font-medium mb-2 text-gray-900">Enter Information</h3>
                  <p className="text-lg text-gray-600">
                    Provide details about your pet or upload images of animals for detection and recognition.
                  </p>
                </div>
              </div>
              <div className="animate-slide-in-bottom staggered-item">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold transition-all duration-300 hover:scale-110">2</div>
                <div className="bg-white  p-4 rounded-lg shadow-md bg-opacity-40 backdrop-blur-sm">
                  <h3 className="text-2xl font-medium mb-2 text-gray-900">AI Processing</h3>
                  <p className="text-lg text-gray-600">
                    Our YOLO and machine learning models analyze the data to provide accurate results and predictions.
                  </p>
                </div>
              </div>
              <div className="animate-slide-in-right staggered-item">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold transition-all duration-300 hover:scale-110">3</div>
                <div className="bg-white p-4 rounded-lg shadow-md bg-opacity-40 backdrop-blur-sm">
                  <h3 className="text-2xl font-medium mb-2 text-gray-900">Get Insights</h3>
                  <p className="text-lg text-white-600">
                    View prediction results, animal recognition data, and conservation information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-4xl font-bold mb-6 text-gray-900 animate-slide-in-top">Ready to get started?</h2>
          <p className="text-2xl text-white max-w-2xl mx-auto mb-8 animate-slide-in-bottom">
            Join us in our mission to enhance pet health and promote wildlife conservation.
          </p>
          <Link 
            href="/animal-detection" 
            className="btn-primary text-lg animate-pulse-once"
          >
            Try Our New Animal Detection
          </Link>
        </section>
      </div>
    </main>
  );
}