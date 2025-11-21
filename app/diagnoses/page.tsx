'use client';

import React from 'react';
import Navigation from '../components/Navigation';
import AnimalHealthDiagnosis from '../components/AnimalHealthDiagnosis';
import PageHeader from '../components/PageHeader';

export default function DiagnosesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Animal Health Diagnosis" 
          description="Upload an image or video of your animal along with symptoms to receive a preliminary diagnosis and treatment recommendations."
        />
        <div className="bg-white p-6 rounded-lg shadow-md">
          <AnimalHealthDiagnosis />
        </div>
      </main>
    </div>
  );
} 