'use client';

import React from 'react';
import Link from 'next/link';
import EndangeredSpeciesInfo from '../components/EndangeredSpeciesInfo';

export default function EndangeredSpeciesPage() {
  return (
    <>
      {/* REMOVED: <Navigation /> */}
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Endangered Species Awareness</h1>
        <p className="mb-6">
          Learn about endangered species and how you can help with conservation efforts.
        </p>
        <EndangeredSpeciesInfo />
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}