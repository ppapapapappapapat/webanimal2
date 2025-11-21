'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/app/database/database';
import type { Detection } from '@/app/database/database';
import { format } from 'date-fns';
import Image from 'next/image';
import { 
  IconSearch, 
  IconMapPin, 
  IconTrash, 
  IconCamera, 
  IconCalendar,
  IconLoader2 
} from '@tabler/icons-react';

export default function AdminDetectionList() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDetections();
  }, []);

  const loadDetections = async () => {
    setLoading(true);
    try {
      const data = await Database.getDetections();
      setDetections(data);
    } catch (error) {
      console.error('Failed to load detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await Database.deleteDetection(deleteId);
      setDetections(detections.filter(d => d.id !== deleteId));
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete detection:', error);
    }
  };

  const filteredDetections = detections.filter(detection => {
    const searchLower = searchTerm.toLowerCase();
    return (
      detection.id.toLowerCase().includes(searchLower) ||
      detection.userId.toLowerCase().includes(searchLower) ||
      (detection.animalId && detection.animalId.toLowerCase().includes(searchLower)) ||
      (detection.notes && detection.notes.toLowerCase().includes(searchLower)) ||
      (detection.observerName && detection.observerName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Animal Detections</h1>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search detections..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <IconLoader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-2 text-gray-600">Loading detections...</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Animal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDetections.length > 0 ? (
                  filteredDetections.map((detection) => (
                    <tr key={detection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {detection.imageUrl && (
                          <div className="relative h-16 w-16 rounded overflow-hidden cursor-pointer"
                               onClick={() => setSelectedDetection(detection)}>
                            <Image
                              src={detection.imageUrl}
                              alt="Detection thumbnail"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {detection.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detection.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detection.animalId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <IconCalendar size={16} className="mr-1 text-gray-400" />
                          {format(new Date(detection.timestamp), 'MMM d, yyyy h:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detection.location ? (
                          <div className="flex items-center">
                            <IconMapPin size={16} className="mr-1 text-gray-400" />
                            {detection.location.latitude.toFixed(4)}, {detection.location.longitude.toFixed(4)}
                          </div>
                        ) : (
                          'No location data'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedDetection(detection)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(detection.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No detection records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this detection record? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detection Detail Modal */}
          {selectedDetection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Detection Details</h3>
                  <button
                    onClick={() => setSelectedDetection(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {selectedDetection.imageUrl && (
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                        <Image
                          src={selectedDetection.imageUrl}
                          alt="Detection image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">ID</h4>
                      <p>{selectedDetection.id}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                      <p>{format(new Date(selectedDetection.timestamp), 'MMMM d, yyyy h:mm:ss a')}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">User ID</h4>
                      <p>{selectedDetection.userId}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Animal ID</h4>
                      <p>{selectedDetection.animalId || 'N/A'}</p>
                    </div>

                    {selectedDetection.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        <p>
                          Latitude: {selectedDetection.location.latitude.toFixed(6)}, 
                          Longitude: {selectedDetection.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}

                    {selectedDetection.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                        <p>{selectedDetection.notes}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Detections</h4>
                      <div className="mt-2 space-y-2">
                        {selectedDetection.detections.map((detection, index) => (
                          <div key={index} className="bg-gray-100 p-3 rounded-md">
                            <div className="flex justify-between">
                              <span className="font-medium">{detection.class}</span>
                              <span className="text-green-600">{(detection.score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Bounding box: [{detection.bbox.join(', ')}]
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedDetection(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 