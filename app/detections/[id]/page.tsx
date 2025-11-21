'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Database, DetectionReport } from '../../database/database';

export default function DetectionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [detection, setDetection] = useState<DetectionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetection = async () => {
      try {
        const report = await Database.getDetectionReportById(params.id);
        setDetection(report);
      } catch (error) {
        console.error('Error fetching detection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetection();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!detection) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Detection Not Found</h1>
          <p className="text-gray-600 mb-4">The detection report you're looking for could not be found.</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">Detection Details</h1>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-96 w-full">
              <Image
                src={detection.imageSource}
                alt="Detection image"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg"
              />
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Detected Animals</h2>
                <div className="space-y-3">
                  {detection.detectedAnimals.map((animal, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{animal.type}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(animal.confidence * 100)}% confidence
                        </span>
                      </div>
                      {animal.isEndangered && (
                        <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Endangered Species
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">Detection Summary</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Total Animals</dt>
                    <dd className="text-lg">{detection.summary.totalAnimals}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Endangered Species</dt>
                    <dd className="text-lg">{detection.summary.endangeredCount}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Highest Confidence</dt>
                    <dd className="text-lg">{Math.round(detection.summary.highestConfidence * 100)}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Average Confidence</dt>
                    <dd className="text-lg">{Math.round(detection.summary.averageConfidence * 100)}%</dd>
                  </div>
                </dl>
              </div>

              <div className="border-t mt-4 pt-4">
                <h2 className="text-lg font-semibold mb-2">Detection Info</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Date</dt>
                    <dd className="text-lg">{new Date(detection.timestamp).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Mode</dt>
                    <dd className="text-lg capitalize">{detection.detectionMode}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 