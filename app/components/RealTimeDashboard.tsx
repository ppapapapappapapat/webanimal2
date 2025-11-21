'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Animal, Detection } from '../database/database';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

interface DetectionStats {
  healthy: number;
  sick: number;
  recovering: number;
  unknown: number;
}

export default function RealTimeDashboard() {
  const { isAuthenticated } = useUser();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [stats, setStats] = useState<DetectionStats>({
    healthy: 0,
    sick: 0,
    recovering: 0,
    unknown: 0,
  });

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:5000/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_detection') {
        setDetections(prev => [...prev, data.detection]);
        updateStats(data.detection);
      }
    };

    // Initial data fetch
    fetchAllData();

    return () => {
      ws.close();
    };
  }, []);

  const fetchAllData = async () => {
    try {
      const [animalsRes, detectionsRes] = await Promise.all([
        axios.get('/api/animals'),
        axios.get('/api/detections')
      ]);
      
      setAnimals(animalsRes.data);
      setDetections(detectionsRes.data);
      updateStatsFromDetections(detectionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateStats = (detection: Detection) => {
    const newStats = { ...stats };
    switch (detection.status) {
      case 'healthy':
        newStats.healthy++;
        break;
      case 'sick':
        newStats.sick++;
        break;
      case 'recovering':
        newStats.recovering++;
        break;
      default:
        newStats.unknown++;
    }
    setStats(newStats);
  };

  const updateStatsFromDetections = (detections: Detection[]) => {
    const newStats = {
      healthy: 0,
      sick: 0,
      recovering: 0,
      unknown: 0,
    };

    detections.forEach(detection => {
      switch (detection.status) {
        case 'healthy':
          newStats.healthy++;
          break;
        case 'sick':
          newStats.sick++;
          break;
        case 'recovering':
          newStats.recovering++;
          break;
        default:
          newStats.unknown++;
      }
    });
    setStats(newStats);
  };

  const lineChartData = {
    labels: detections.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Detection Confidence',
        data: detections.map(d => d.confidence * 100),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const barChartData = {
    labels: ['Healthy', 'Sick', 'Recovering', 'Unknown'],
    datasets: [
      {
        data: [stats.healthy, stats.sick, stats.recovering, stats.unknown],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(201, 203, 207, 0.2)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(201, 203, 207)',
        ],
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Real-Time Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Detection Statistics</h3>
          <Bar data={barChartData} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Detection History</h3>
          <Line data={lineChartData} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Recent Detections</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Animal</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {detections.slice(0, 10).map((detection, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{detection.animalName}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      detection.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      detection.status === 'sick' ? 'bg-red-100 text-red-800' :
                      detection.status === 'recovering' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {detection.status}
                    </span>
                  </td>
                  <td className="p-2">{new Date(detection.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2">{Math.round(detection.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
