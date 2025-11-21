'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import { Database, Detection } from '../../../database/database';

export default function DetectionPage() {
  const params = useParams();
  const [detection, setDetection] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetection = async () => {
      try {
        const detectionData = await Database.getDetectionById(params.id as string);
        if (detectionData) {
          setDetection(detectionData);
        } else {
          setError('Detection not found');
        }
      } catch (err) {
        setError('Error loading detection');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetection();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !detection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Detection not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Detection Details</h1>
          
          {/* Detection Image */}
          <div className="mb-8">
            <img 
              src={detection.imageUrl} 
              alt="Detected Animal" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
            />
          </div>

          {/* Detection Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Detection Information</h2>
              <div className="space-y-3">
                <p><span className="font-medium">ID:</span> {detection.id}</p>
                <p><span className="font-medium">Timestamp:</span> {detection.timestamp.toString()}</p>
                <p><span className="font-medium">User ID:</span> {detection.userId}</p>
                {detection.animalId && (
                  <p><span className="font-medium">Animal ID:</span> {detection.animalId}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Detected Animals</h2>
              <div className="space-y-4">
                {detection.detections.map((det, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <p><span className="font-medium">Class:</span> {det.class}</p>
                    <p><span className="font-medium">Confidence:</span> {(det.score * 100).toFixed(2)}%</p>
                    {det.isEndangered && (
                      <p className="text-red-600 font-medium mt-1">Endangered Species</p>
                    )}
                    {det.taxonomy && (
                      <div className="mt-2">
                        <p className="font-medium">Taxonomy:</p>
                        <ul className="ml-4 text-sm text-gray-600">
                          {det.taxonomy.phylum && <li>Phylum: {det.taxonomy.phylum}</li>}
                          {det.taxonomy.class && <li>Class: {det.taxonomy.class}</li>}
                          {det.taxonomy.order && <li>Order: {det.taxonomy.order}</li>}
                          {det.taxonomy.family && <li>Family: {det.taxonomy.family}</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location Information */}
          {detection.location && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <p>
                <span className="font-medium">Latitude:</span> {detection.location.latitude.toFixed(4)}, 
                <span className="font-medium ml-4">Longitude:</span> {detection.location.longitude.toFixed(4)}
              </p>
            </div>
          )}

          {/* Notes */}
          {detection.notes && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-gray-600">{detection.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 