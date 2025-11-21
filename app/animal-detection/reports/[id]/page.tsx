'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Database, DetectionReport } from '../../../database/database';

export default function DetectionReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<DetectionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // State for saving status

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const userId = 'user_1'; // Replace with the actual userId from context or props
        const fetchedReports = await Database.getDetectionReports(userId); // Pass userId as an argument
        const fetchedReport = fetchedReports.find((report) => report.id === params.id); // Find the specific report by ID
        setReport(fetchedReport || null);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const handleSaveToDatabase = async () => {
    if (!report) return;

    setIsSaving(true);
    try {
      await Database.saveDetectionReport(report); // Save the report to the database
      alert('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save the report.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Report Not Found</h1>
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
            <h1 className="text-2xl font-bold">Detection Report</h1>
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
                src={report.imageSource}
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
                  {report.detectedAnimals.map((animal, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{animal.type}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(animal.confidence * 100)}% confidence
                        </span>
                      </div>
                      {animal.isEndangered && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Endangered Species
                          </span>
                          {animal.details && (
                            <div className="mt-2 text-sm">
                              <p><strong>Status:</strong> {animal.details.conservationStatus}</p>
                              <p><strong>Population:</strong> {animal.details.population}</p>
                              <p><strong>Habitat:</strong> {animal.details.habitat}</p>
                            </div>
                          )}
                        </div>
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
                    <dd className="text-lg">{report.summary.totalAnimals}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Endangered Species</dt>
                    <dd className="text-lg">{report.summary.endangeredCount}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Highest Confidence</dt>
                    <dd className="text-lg">{Math.round(report.summary.highestConfidence * 100)}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Average Confidence</dt>
                    <dd className="text-lg">{Math.round(report.summary.averageConfidence * 100)}%</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveToDatabase}
                  className={`px-4 py-2 text-white rounded ${
                    isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save to SQL Database'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}