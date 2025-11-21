'use client';

import React from 'react';
import AnimalDetection from '../components/AnimalDetection';
import Head from 'next/head';

export default function AnimalDetectionPage() {
  return (
    <>
      <Head>
        <title>PawthCare | Animal Detection & Conservation</title>
        <meta name="description" content="The path to better animal health and awareness." />
      </Head>
      <main className="min-h-screen bg-gray-50">
        {/* REMOVED: <Navigation /> */}
        <div className="container mx-auto px-4 py-4">
          <AnimalDetection />
        </div>
      </main>
    </>
  );
}