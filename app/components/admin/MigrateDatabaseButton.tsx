'use client';

import { useState } from 'react';
import { IconDatabase, IconCheck, IconX } from '@tabler/icons-react';

export default function MigrateDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleMigrate = async () => {
    if (!confirm('Are you sure you want to migrate the mock data to the database? This operation cannot be undone.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed');
      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'An error occurred while migrating data'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to the server'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleMigrate}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <IconDatabase size={18} />
        <span>{loading ? 'Migrating...' : 'Migrate Mock Data'}</span>
      </button>

      {result && (
        <div
          className={`mt-2 p-2 rounded-md text-sm ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <div className="flex items-center gap-1">
            {result.success ? (
              <IconCheck size={16} className="text-green-600" />
            ) : (
              <IconX size={16} className="text-red-600" />
            )}
            <span>{result.message}</span>
          </div>
        </div>
      )}
    </div>
  );
} 