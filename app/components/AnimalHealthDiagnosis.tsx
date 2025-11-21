'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Database } from '../database/database';

interface DiagnosisResult {
  condition: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
  followUpRecommended: boolean;
}

export default function AnimalHealthDiagnosis() {
  const [file, setFile] = useState<File | null>(null);
  const [animalType, setAnimalType] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const diagnosisCardRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDiagnosisResult(null);
    
    if (!file) {
      setError('Please upload an image or video of your animal');
      return;
    }

    if (!animalType) {
      setError('Please select animal type');
      return;
    }

    if (!symptoms.trim()) {
      setError('Please describe the symptoms');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to diagnosis service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock diagnosis result based on symptoms
      const mockDiagnosis = generateCombinedDiagnosis(animalType, symptoms);
      setDiagnosisResult(mockDiagnosis);
      
      // Log diagnosis for record-keeping using static method
      await Database.logDiagnosis({
        animalType,
        symptoms,
        diagnosis: mockDiagnosis.condition,
        date: new Date().toISOString(),
        userId: 'user123', // In a real app, this would be the authenticated user's ID
        imageUrl: 'mock-url' // In a real app, this would be the uploaded image URL
      });
    } catch (err) {
      setError('Failed to generate diagnosis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setAnimalType('');
    setSymptoms('');
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateCombinedDiagnosis = (animalType: string, symptoms: string): DiagnosisResult => {
    const symptomLower = symptoms.toLowerCase();

    const followUpText = (type: string) => {
      if (type === 'Urgent' || type === 'Required') {
        return true;
      } else if (type === 'Recommended') {
        return true;
      } else {
        return false;
      }
    };

    const table: Array<{
      keywords: string[];
      condition: string;
      description: string;
      treatment: string;
      severity: 'low' | 'medium' | 'high';
      followUp: 'Urgent' | 'Required' | 'Recommended' | 'Optional';
      confidence: number;
    }> = [
      {
        keywords: ['bleed', 'bleeding'],
        condition: 'External Injury or Internal Trauma',
        description: 'Bleeding can be due to external wounds or internal trauma.',
        treatment: 'Clean the wound if visible, stop bleeding, visit vet immediately if it doesn\'t stop.',
        severity: 'high',
        followUp: 'Required',
        confidence: 0.95
      },
      {
        keywords: ['vomit', 'throw up'],
        condition: 'Gastroenteritis, Toxin Ingestion',
        description: 'Vomiting may be caused by infection or toxin ingestion.',
        treatment: 'Withhold food for 12 hrs, offer water. Seek vet care if frequent or with blood.',
        severity: 'medium',
        followUp: 'Required',
        confidence: 0.85
      },
      {
        keywords: ['diarrhea', 'loose stool'],
        condition: 'Infection, Parasites, Diet Change',
        description: 'Diarrhea can be due to infection, parasites, or diet change.',
        treatment: 'Hydrate, bland diet. See vet if persistent >24 hrs or with blood.',
        severity: 'medium',
        followUp: 'Recommended',
        confidence: 0.8
      },
      {
        keywords: ['lethargy', 'tired', 'weak'],
        condition: 'Infection, Pain, Anemia',
        description: 'Lethargy can be due to infection, pain, or anemia.',
        treatment: 'Ensure rest, monitor food intake, visit vet for blood work if no improvement in 24 hrs.',
        severity: 'medium',
        followUp: 'Recommended',
        confidence: 0.8
      },
      {
        keywords: ['cough', 'coughing'],
        condition: 'Respiratory Infection, Heartworm',
        description: 'Coughing may indicate respiratory infection or heartworm.',
        treatment: 'Isolate, keep warm, consult vet for diagnostics and meds.',
        severity: 'medium',
        followUp: 'Required',
        confidence: 0.8
      },
      {
        keywords: ['sneeze', 'sneezing'],
        condition: 'Upper Respiratory Infection',
        description: 'Sneezing may indicate upper respiratory infection.',
        treatment: 'Monitor. Keep indoors. Vet may prescribe antibiotics if persistent.',
        severity: 'low',
        followUp: 'Optional',
        confidence: 0.7
      },
      {
        keywords: ['loss of appetite', 'not eating', 'anorexia'],
        condition: 'Pain, Stress, Illness',
        description: 'Loss of appetite can be due to pain, stress, or illness.',
        treatment: 'Offer tempting food. Vet check if more than 24 hrs or with weight loss.',
        severity: 'medium',
        followUp: 'Recommended',
        confidence: 0.75
      },
      {
        keywords: ['thirst', 'excessive thirst', 'drinking a lot'],
        condition: 'Diabetes, Kidney Disease',
        description: 'Excessive thirst may indicate diabetes or kidney disease.',
        treatment: 'Measure water intake. Vet tests recommended (urinalysis, bloodwork).',
        severity: 'medium',
        followUp: 'Required',
        confidence: 0.8
      },
      {
        keywords: ["limp", "limping", "can't walk", "cant walk", "paralyze", "paw injury"],
        condition: 'Injury, Arthritis, Paw Injury',
        description: 'Limping may be due to injury, arthritis, or paw injury.',
        treatment: 'Limit movement, inspect paws. Vet for X-ray if no improvement in 2 days.',
        severity: 'medium',
        followUp: 'Required',
        confidence: 0.8
      },
      {
        keywords: ['swollen abdomen', 'bloat', 'distended belly'],
        condition: 'Bloat, Internal Issue',
        description: 'Swollen abdomen can be a sign of bloat or internal issue.',
        treatment: 'Emergency vet care immediately (especially in dogs).',
        severity: 'high',
        followUp: 'Urgent',
        confidence: 0.95
      },
      {
        keywords: ['seizure', 'seizures', 'convulsion'],
        condition: 'Neurological Issue, Toxins',
        description: 'Seizures can be caused by neurological issues or toxins.',
        treatment: 'Keep animal safe, time seizures. Emergency vet visit if first-time or frequent.',
        severity: 'high',
        followUp: 'Urgent',
        confidence: 0.95
      },
      {
        keywords: ['itch', 'itching', 'scratch', 'scratching'],
        condition: 'Allergies, Fleas, Skin Infection',
        description: 'Itching or scratching may indicate allergies, fleas, or skin infection.',
        treatment: 'Check for fleas, bathe with medicated shampoo. Vet for allergy meds if persistent.',
        severity: 'low',
        followUp: 'Optional',
        confidence: 0.7
      },
      {
        keywords: ['labored breathing', 'difficulty breathing', 'breathing hard'],
        condition: 'Asthma, Heart Issue, Fluid in Lungs',
        description: 'Labored breathing can be a sign of asthma, heart issue, or fluid in lungs.',
        treatment: 'Keep calm, no exertion. Emergency vet if sustained or worsening.',
        severity: 'high',
        followUp: 'Urgent',
        confidence: 0.95
      },
      {
        keywords: ['pale gums'],
        condition: 'Anemia, Shock, Blood Loss',
        description: 'Pale gums can indicate anemia, shock, or blood loss.',
        treatment: 'Emergency — vet required for bloodwork and diagnosis.',
        severity: 'high',
        followUp: 'Urgent',
        confidence: 0.95
      },
    ];

    // Find all matches
    const matches = table.filter(row => row.keywords.some(kw => symptomLower.includes(kw)));
    if (matches.length > 0) {
      // Combine all unique diagnoses, treatments, and descriptions
      const allConditions = Array.from(new Set(matches.map(m => m.condition))).join(', ');
      const allDescriptions = Array.from(new Set(matches.map(m => m.description))).join(' ');
      const allTreatments = Array.from(new Set(matches.map(m => m.treatment)));
      // Highest severity
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const highestSeverity = matches.reduce((prev, curr) => severityOrder[curr.severity] > severityOrder[prev.severity] ? curr : prev).severity;
      // Most urgent follow-up
      const followUpOrder = { Urgent: 3, Required: 2, Recommended: 1, Optional: 0 };
      const mostUrgentFollowUp = matches.reduce((prev, curr) => followUpOrder[curr.followUp] > followUpOrder[prev.followUp] ? curr : prev).followUp;
      // Highest confidence
      const highestConfidence = Math.max(...matches.map(m => m.confidence));
      return {
        condition: allConditions,
        confidence: highestConfidence,
        description: allDescriptions,
        treatment: allTreatments.join('\n'),
        severity: highestSeverity,
        followUpRecommended: followUpText(mostUrgentFollowUp)
      };
    }

    // Fallback
    return {
      condition: 'General Discomfort',
      confidence: 0.65,
      description: 'Non-specific symptoms that could indicate a variety of conditions.',
      treatment: 'Monitor for changes, ensure proper nutrition and hydration, consult a veterinarian if symptoms persist.',
      severity: 'low',
      followUpRecommended: true
    };
  };

  const handlePrint = () => {
    if (!diagnosisCardRef.current) return;
    const printContents = diagnosisCardRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Diagnosis Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f9f9f9; }
              .print-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 24px; max-width: 700px; margin: 0 auto; }
              h2 { color: #2563eb; }
              .text-red-800 { color: #b91c1c; }
              .text-yellow-800 { color: #b45309; }
              .text-green-800 { color: #065f46; }
              .bg-red-100 { background: #fee2e2; }
              .bg-yellow-100 { background: #fef3c7; }
              .bg-green-100 { background: #d1fae5; }
              .bg-blue-50 { background: #eff6ff; }
              .text-blue-700 { color: #1d4ed8; }
              .rounded { border-radius: 0.25rem; }
              .rounded-lg { border-radius: 0.5rem; }
              .font-medium { font-weight: 500; }
              .font-semibold { font-weight: 600; }
              .font-bold { font-weight: 700; }
              .mb-3 { margin-bottom: 0.75rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-6 { margin-bottom: 1.5rem; }
              .p-3 { padding: 0.75rem; }
              .p-4 { padding: 1rem; }
              .w-full { width: 100%; }
              .h-64 { height: 16rem; }
              .object-cover { object-fit: cover; }
              .text-sm { font-size: 0.875rem; }
              .text-xs { font-size: 0.75rem; }
              .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
              .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
              .list-disc { list-style-type: disc; }
              .ml-2 { margin-left: 0.5rem; }
              .ml-5 { margin-left: 1.25rem; }
            </style>
          </head>
          <body>
            <div class="print-card">${printContents}</div>
            <script>window.onload = function() { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {diagnosisResult ? (
        <div ref={diagnosisCardRef} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Diagnosis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              {previewUrl && (
                <div className="mb-4">
                  {file?.type.startsWith('image/') ? (
                    <img 
                      src={previewUrl} 
                      alt="Uploaded animal" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <video 
                      src={previewUrl} 
                      controls 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Animal Type:</span> {animalType}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Symptoms:</span> {symptoms}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <span className="text-lg font-semibold">{diagnosisResult.condition}</span>
                <div className="flex items-center mt-1">
                  <div className="bg-gray-200 h-2 w-full rounded-full">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${diagnosisResult.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{Math.round(diagnosisResult.confidence * 100)}%</span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-700">{diagnosisResult.description}</p>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium text-gray-900">Recommended Treatment:</h3>
                <ul className="list-disc ml-5">
                  {diagnosisResult.treatment.split('\n').map((t, i) => (
                    <li key={i} className="text-sm text-gray-700">{t}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium text-gray-900">Severity:</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  diagnosisResult.severity === 'high' ? 'bg-red-100 text-red-800' :
                  diagnosisResult.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {diagnosisResult.severity.charAt(0).toUpperCase() + diagnosisResult.severity.slice(1)}
                </span>
              </div>
              
              {diagnosisResult.followUpRecommended && (
                <div className="text-sm bg-blue-50 text-blue-700 p-3 rounded-lg">
                  <p className="font-medium">Follow-up recommended</p>
                  <p>Please consult with a veterinarian for a professional diagnosis and treatment plan.</p>
                </div>
              )}
              {/* Save Diagnosis Button */}
              <div className="flex gap-2 mt-2">
                <button
                  className={`px-4 py-2 rounded text-white font-semibold ${
                    saveStatus === 'success' ? 'bg-green-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={saveStatus === 'saving' || saveStatus === 'success'}
                  onClick={async () => {
                    setSaveStatus('saving');
                    try {
                      await Database.logDiagnosis({
                        animalType,
                        symptoms,
                        diagnosis: diagnosisResult.condition,
                        date: new Date().toISOString(),
                        userId: 'user123', // Replace with real user ID if available
                        imageUrl: previewUrl || ''
                      });
                      setSaveStatus('success');
                    } catch (err) {
                      setSaveStatus('error');
                    }
                  }}
                >
                  {saveStatus === 'idle' && 'Save Diagnosis'}
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'success' && 'Saved!'}
                  {saveStatus === 'error' && 'Error Saving'}
                </button>
                <button
                  className="px-4 py-2 rounded text-white font-semibold bg-gray-600 hover:bg-gray-700"
                  onClick={handlePrint}
                  type="button"
                >
                  Print as PDF
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Start New Diagnosis
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image or Video
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ref={fileInputRef}
            />
            {previewUrl && (
              <div className="mt-2">
                {file?.type.startsWith('image/') ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-48 w-auto object-cover rounded-md"
                  />
                ) : (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="h-48 w-auto object-cover rounded-md"
                  />
                )}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="animalType" className="block text-sm font-medium text-gray-700 mb-1">
              Animal Type
            </label>
            <select
              id="animalType"
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select animal type</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Horse">Horse</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Reptile">Reptile</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
              Describe Symptoms
            </label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe what symptoms you've observed (coughing, lethargy, loss of appetite, etc.)"
              required
            ></textarea>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded flex items-center`}
            >
              {isLoading ? 'Diagnosing...' : 'Diagnose'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}