'use client';

import React, { useState, useEffect } from 'react';
import { Animal, Database, Detection } from '../database/database';
import { useUser } from '../context/UserContext';
import Image from 'next/image';
import Link from 'next/link';

interface HealthAssessmentResult {
  status: 'healthy' | 'sick' | 'recovering' | 'unknown';
  confidence: number;
  possibleIllnesses: string[];
  recommendations: string[];
}

interface AnimalHealthAssessmentProps {
  animalId?: string;
  detection?: Detection;
}

export default function AnimalHealthAssessment({ animalId, detection }: AnimalHealthAssessmentProps) {
  const { user, isAuthenticated } = useUser();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessmentResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (animalId) {
      fetchAnimal(animalId);
    }
    
    if (detection) {
      setUploadedImage(detection.imageUrl);
      // Automatically analyze the detection image
      analyzeDetectionImage(detection);
    }
  }, [animalId, detection]);
  
  const fetchAnimal = async (id: string) => {
    try {
      setLoading(true);
      const animalData = await Database.getAnimalById(id);
      setAnimal(animalData);
    } catch (err) {
      console.error('Error fetching animal:', err);
      setError('Failed to load animal data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const analyzeImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }
    
    try {
      setAnalyzing(true);
      setError(null);
      
      // Simulate AI health assessment with random results
      // In a real app, this would call an AI service API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const statuses: Array<'healthy' | 'sick' | 'recovering' | 'unknown'> = ['healthy', 'sick', 'recovering', 'unknown'];
      const randomStatus = statuses[Math.floor(Math.random() * 3)]; // Skew toward non-unknown
      
      const possibleIllnesses = [
        'Respiratory infection',
        'Skin condition',
        'Joint inflammation',
        'Digestive issue',
        'Parasitic infection',
        'Dental problem',
        'Eye infection',
        'Ear infection',
        'Nutritional deficiency'
      ];
      
      const recommendations = [
        'Consult veterinarian for diagnosis',
        'Ensure proper hydration',
        'Monitor food intake',
        'Provide a quiet resting environment',
        'Check temperature regularly',
        'Maintain clean living conditions',
        'Administer prescribed medication',
        'Avoid contact with other animals',
        'Schedule follow-up examination'
      ];
      
      // Generate more realistic assessment based on status
      let assessment: HealthAssessmentResult;
      
      if (randomStatus === 'healthy') {
        assessment = {
          status: 'healthy',
          confidence: 0.85 + Math.random() * 0.15,
          possibleIllnesses: [],
          recommendations: ['Maintain regular checkups', 'Continue balanced diet', 'Ensure regular exercise']
        };
      } else if (randomStatus === 'recovering') {
        // Select 1-2 illnesses
        const illnessCount = Math.floor(Math.random() * 2) + 1;
        const selectedIllnesses = shuffleArray([...possibleIllnesses]).slice(0, illnessCount);
        
        // Select 3-4 recommendations
        const recommendationCount = Math.floor(Math.random() * 2) + 3;
        const selectedRecommendations = shuffleArray([...recommendations]).slice(0, recommendationCount);
        
        assessment = {
          status: 'recovering',
          confidence: 0.70 + Math.random() * 0.20,
          possibleIllnesses: selectedIllnesses,
          recommendations: selectedRecommendations
        };
      } else if (randomStatus === 'sick') {
        // Select 2-3 illnesses
        const illnessCount = Math.floor(Math.random() * 2) + 2;
        const selectedIllnesses = shuffleArray([...possibleIllnesses]).slice(0, illnessCount);
        
        // Select 4-5 recommendations
        const recommendationCount = Math.floor(Math.random() * 2) + 4;
        const selectedRecommendations = shuffleArray([...recommendations]).slice(0, recommendationCount);
        
        assessment = {
          status: 'sick',
          confidence: 0.75 + Math.random() * 0.20,
          possibleIllnesses: selectedIllnesses,
          recommendations: selectedRecommendations
        };
      } else {
        assessment = {
          status: 'unknown',
          confidence: 0.50 + Math.random() * 0.30,
          possibleIllnesses: [],
          recommendations: ['Consult with a veterinarian for proper assessment']
        };
      }
      
      setHealthAssessment(assessment);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeDetectionImage = async (detection: Detection) => {
    try {
      setAnalyzing(true);
      setError(null);
      
      // In a real app, this would use detection data to determine health status
      // For demo purposes, create a status based on detection data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use detection data to influence health assessment
      const hasHighConfidenceDetections = detection.detections.some(d => d.score > 0.85);
      const animalClass = detection.detections[0]?.class || 'unknown';
      
      let assessment: HealthAssessmentResult;
      
      // Generate assessment based on detection details
      if (hasHighConfidenceDetections) {
        // Higher chance of healthy or recovering
        const randVal = Math.random();
        if (randVal > 0.3) {
          assessment = {
            status: 'healthy',
            confidence: 0.85 + Math.random() * 0.15,
            possibleIllnesses: [],
            recommendations: [
              'Continue regular check-ups',
              'Maintain balanced nutrition',
              `Ensure appropriate exercise for ${animalClass}`
            ]
          };
        } else if (randVal > 0.1) {
          assessment = {
            status: 'recovering',
            confidence: 0.75 + Math.random() * 0.15,
            possibleIllnesses: ['Minor ' + possibleIllnesses[Math.floor(Math.random() * possibleIllnesses.length)]],
            recommendations: [
              'Continue prescribed treatment',
              'Schedule follow-up examination',
              'Monitor for improvements'
            ]
          };
        } else {
          // Select 1-2 illnesses
          const selectedIllnesses = shuffleArray([...possibleIllnesses]).slice(0, 2);
          assessment = {
            status: 'sick',
            confidence: 0.80 + Math.random() * 0.15,
            possibleIllnesses: selectedIllnesses,
            recommendations: [
              'Consult veterinarian immediately',
              'Isolate from other animals if contagious',
              'Administer prescribed medications'
            ]
          };
        }
      } else {
        // Lower confidence detections have higher chance of issues
        const randVal = Math.random();
        if (randVal > 0.6) {
          assessment = {
            status: 'healthy',
            confidence: 0.65 + Math.random() * 0.20,
            possibleIllnesses: [],
            recommendations: ['Schedule regular check-up']
          };
        } else if (randVal > 0.3) {
          assessment = {
            status: 'recovering',
            confidence: 0.60 + Math.random() * 0.20,
            possibleIllnesses: ['Possible ' + possibleIllnesses[Math.floor(Math.random() * possibleIllnesses.length)]],
            recommendations: [
              'Monitor for changes in behavior',
              'Follow up with veterinarian'
            ]
          };
        } else {
          // Select 1-2 illnesses
          const selectedIllnesses = shuffleArray([...possibleIllnesses]).slice(0, 2);
          assessment = {
            status: 'sick',
            confidence: 0.70 + Math.random() * 0.15,
            possibleIllnesses: selectedIllnesses.map(illness => 'Suspected ' + illness),
            recommendations: [
              'Seek veterinary assessment',
              'Monitor vital signs',
              'Provide supportive care'
            ]
          };
        }
      }
      
      setHealthAssessment(assessment);
    } catch (err) {
      console.error('Error analyzing detection:', err);
      setError('Failed to analyze detection data');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const saveHealthAssessment = async () => {
    if (!healthAssessment || !animalId) {
      setError('Cannot save assessment. Missing data.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update animal status based on health assessment
      const updatedAnimal = await Database.updateAnimal(animalId, {
        status: healthAssessment.status,
        medicalHistory: [
          ...(animal?.medicalHistory || []),
          `[${new Date().toISOString()}] AI Health Assessment: ${healthAssessment.status} (Confidence: ${Math.round(healthAssessment.confidence * 100)}%)` +
          (healthAssessment.possibleIllnesses.length > 0 
            ? ` - Possible issues: ${healthAssessment.possibleIllnesses.join(', ')}` 
            : '')
        ]
      });
      
      if (updatedAnimal) {
        setAnimal(updatedAnimal);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving health assessment:', err);
      setError('Failed to save health assessment to animal record');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to shuffle array
  const shuffleArray = <T extends any>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const getStatusColor = (status: 'healthy' | 'sick' | 'recovering' | 'unknown') => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      case 'recovering': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const possibleIllnesses = [
    'Respiratory infection',
    'Skin condition',
    'Joint inflammation',
    'Digestive issue',
    'Parasitic infection',
    'Dental problem',
    'Eye infection',
    'Ear infection',
    'Nutritional deficiency'
  ];
  
  const recommendations = [
    'Consult veterinarian for diagnosis',
    'Ensure proper hydration',
    'Monitor food intake',
    'Provide a quiet resting environment',
    'Check temperature regularly',
    'Maintain clean living conditions',
    'Administer prescribed medication',
    'Avoid contact with other animals',
    'Schedule follow-up examination'
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Animal Health Assessment</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}
      
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          Health assessment saved successfully!
        </div>
      )}
      
      {animal && (
        <div className="mb-6 flex items-center">
          <div className="h-16 w-16 mr-4 relative rounded-full overflow-hidden">
            {animal.imageUrl ? (
              <Image 
                src={animal.imageUrl}
                alt={animal.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                {animal.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">{animal.name}</h3>
            <p className="text-gray-500">{animal.species}{animal.breed ? ` • ${animal.breed}` : ''}</p>
          </div>
        </div>
      )}
      
      {!detection && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image for Analysis
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={analyzeImage}
              disabled={!uploadedImage || analyzing}
              className={`px-4 py-2 rounded-md text-white ${
                !uploadedImage || analyzing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      )}
      
      {uploadedImage && (
        <div className="mb-6">
          <div className="rounded-md overflow-hidden border border-gray-200 mb-2" style={{ maxHeight: '300px' }}>
            <img
              src={uploadedImage}
              alt="Uploaded image"
              className="w-full h-auto object-contain"
            />
          </div>
          {analyzing && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-gray-600">Analyzing image with AI...</span>
            </div>
          )}
        </div>
      )}
      
      {healthAssessment && (
        <div className={`border rounded-md p-4 mb-6 ${getStatusColor(healthAssessment.status)}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">Health Assessment Results</h3>
              <p className="text-sm mt-1">
                Confidence: {Math.round(healthAssessment.confidence * 100)}%
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-sm font-medium capitalize">
              {healthAssessment.status}
            </div>
          </div>
          
          {healthAssessment.possibleIllnesses.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Possible Health Issues:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {healthAssessment.possibleIllnesses.map((illness, index) => (
                  <li key={index} className="text-sm">{illness}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {healthAssessment.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </div>
          
          {animalId && isAuthenticated && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={saveHealthAssessment}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save to Animal Record'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 