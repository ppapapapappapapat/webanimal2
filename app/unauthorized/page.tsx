'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';

export default function UnauthorizedPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg
            className="w-20 h-20 text-red-500 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </>
  );
} 