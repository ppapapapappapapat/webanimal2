'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Database } from '@/app/database/database';

// Fix the Leaflet icon issue
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Initialize the database
const db = new Database();

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Define types for tracking data
interface Detection {
  id: string;
  animalId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  imageUrl?: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  description?: string;
  imageUrl?: string;
  trackingId?: string;
  status: 'active' | 'inactive';
  lastSeen?: string;
  tags?: string[];
}

interface TrackedAnimal extends Animal {
  detections: Detection[];
}

interface MapMarker {
  id: string;
  position: [number, number];
  animal: Animal;
  detection: Detection;
}

export default function GlobalWildlifeTracker() {
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<TrackedAnimal[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Get all animals
        const allAnimals = await db.getAnimals();
        
        // For each animal, get its detections
        const animalsWithDetections = await Promise.all(
          allAnimals.map(async (animal) => {
            const detections = await db.getDetectionsByAnimalId(animal.id);
            return {
              ...animal,
              detections
            };
          })
        );
        
        setAnimals(animalsWithDetections);
        
        // Create markers from detections
        const newMarkers: MapMarker[] = [];
        animalsWithDetections.forEach(animal => {
          animal.detections.forEach(detection => {
            newMarkers.push({
              id: detection.id,
              position: [detection.location.latitude, detection.location.longitude],
              animal,
              detection
            });
          });
        });
        
        setMarkers(newMarkers);
      } catch (error) {
        console.error("Error fetching wildlife data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="stats-summary grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-green-100 p-4 rounded-lg shadow">
          <div className="stat-title text-gray-600">Total Animals</div>
          <div className="stat-value text-3xl font-bold text-green-800">{animals.length}</div>
        </div>
        
        <div className="stat bg-blue-100 p-4 rounded-lg shadow">
          <div className="stat-title text-gray-600">Active Trackers</div>
          <div className="stat-value text-3xl font-bold text-blue-800">
            {animals.filter(a => a.status === 'active').length}
          </div>
        </div>
        
        <div className="stat bg-amber-100 p-4 rounded-lg shadow">
          <div className="stat-title text-gray-600">Total Detections</div>
          <div className="stat-value text-3xl font-bold text-amber-800">
            {markers.length}
          </div>
        </div>
      </div>
      
      <div className="map-container h-[70vh] z-0 rounded-lg overflow-hidden shadow-md">
        {markers.length > 0 && (
          <MapContainer 
            center={markers[0].position} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {markers.map((marker) => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="popup-content">
                    <h3 className="text-lg font-semibold">{marker.animal.name}</h3>
                    <p className="text-sm text-gray-600">{marker.animal.species}</p>
                    {marker.animal.imageUrl && (
                      <img 
                        src={marker.animal.imageUrl} 
                        alt={marker.animal.name}
                        className="w-full h-32 object-cover my-2 rounded"
                      />
                    )}
                    <p className="text-xs mt-1">
                      <strong>Detected:</strong> {new Date(marker.detection.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs">
                      <strong>Confidence:</strong> {(marker.detection.confidence * 100).toFixed(1)}%
                    </p>
                    {marker.detection.imageUrl && (
                      <a 
                        href={marker.detection.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs block mt-1"
                      >
                        View detection image
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      
      <div className="recent-detections mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Detections</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Animal</th>
                <th className="py-3 px-4 text-left">Species</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Date/Time</th>
                <th className="py-3 px-4 text-left">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {markers.slice(0, 10).map((marker) => (
                <tr key={marker.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{marker.animal.name}</td>
                  <td className="py-3 px-4">{marker.animal.species}</td>
                  <td className="py-3 px-4">
                    {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(marker.detection.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${marker.detection.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{(marker.detection.confidence * 100).toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 