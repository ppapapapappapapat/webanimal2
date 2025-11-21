"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useUser } from '../context/UserContext';

const API_URL = "http://192.168.100.77:5000";

// Define types for better TypeScript support
interface FormData {
  date: string;
  location: string;
  observerNotes: string;
  numberOfAnimals: string;
  behavior: string;
  userContact: string;
}

interface AnimalInfo {
  conservation_status?: string;
  habitat?: string;
  lifespan?: string;
  population?: string;
  care_injured?: string;
  care_malnourished?: string;
}

interface DetectionData {
  class: string;
  confidence: number;
  animal_info?: AnimalInfo;
  condition: string;
  conditionConfidence: number;
  fullDetectionData?: any;
}

interface SightingDetailsFormProps {
  showReportForm: boolean;
  currentAnimalToReport: string | null;
  currentDetectionData: DetectionData | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

// Separate form component to prevent re-renders
const SightingDetailsForm: React.FC<SightingDetailsFormProps> = ({ 
  showReportForm, 
  currentAnimalToReport, 
  currentDetectionData, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().slice(0, 16),
    location: "",
    observerNotes: "",
    numberOfAnimals: "1",
    behavior: "",
    userContact: ""
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!showReportForm || !currentAnimalToReport || !currentDetectionData) return null;

  const determineUrgency = (detectionData: DetectionData | null): string => {
    if (!detectionData) return "medium";
    const condition = detectionData.condition?.toLowerCase();
    const conservationStatus = detectionData.animal_info?.conservation_status?.toLowerCase();
    
    if (condition?.includes('injured') || condition?.includes('critical')) {
      return "high";
    }
    if (conservationStatus?.includes('critically endangered')) {
      return "high";
    }
    if (conservationStatus?.includes('endangered') || condition?.includes('malnourished')) {
      return "medium";
    }
    if (condition?.includes('healthy') || 
        conservationStatus?.includes('least concern') ||
        conservationStatus?.includes('vulnerable')) {
      return "low";
    }
    return "medium";
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, string> = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    
    const labels: Record<string, string> = {
      high: "🚨 High Urgency",
      medium: "⚠️ Medium Urgency", 
      low: "✅ Low Urgency"
    };
    
    const style = styles[urgency] || styles.medium;
    const label = labels[urgency] || labels.medium;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${style}`}>
        {label}
      </span>
    );
  };

  const urgency = determineUrgency(currentDetectionData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleFormSubmit} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">📝 Report Sighting Details</h3>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Animal Detection Summary</h4>
            <p><strong>Species:</strong> {currentAnimalToReport}</p>
            <p><strong>Condition:</strong> {currentDetectionData.condition}</p>
            <p><strong>Confidence:</strong> {(currentDetectionData.confidence * 100).toFixed(1)}%</p>
            <div className="mt-2">
              {getUrgencyBadge(urgency)}
              <p className="text-sm text-blue-600 mt-1">
                Urgency automatically determined based on species condition and conservation status.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Date and Time of Sighting *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Specific Location / Landmark *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Near the main river bend, Sitio XYZ, Barangay ABC..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🐾 Number of Animals Observed
              </label>
              <select
                name="numberOfAnimals"
                value={formData.numberOfAnimals}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num.toString()}>{num} {num === 1 ? 'animal' : 'animals'}</option>
                ))}
                <option value="11">More than 10</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🐾 Behavior Observed
              </label>
              <input
                type="text"
                name="behavior"
                value={formData.behavior}
                onChange={handleInputChange}
                placeholder="e.g., Flying, Resting, Feeding, Moving slowly, In distress..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Your Observations & Notes *
              </label>
              <textarea
                name="observerNotes"
                value={formData.observerNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Please provide additional details about what you observed. For example: 'The animal was hanging low on a tree branch and seemed unable to fly. It appeared to have a visible injury on its left wing. No other animals were nearby.'"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📞 Your Contact Info (Optional, for follow-up)
              </label>
              <input
                type="text"
                name="userContact"
                value={formData.userContact}
                onChange={handleInputChange}
                placeholder="Email or Phone Number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.location || !formData.observerNotes}
            >
              📨 Submit Detailed Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 flex-1 py-2 px-4 rounded-md"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Required fields. Your detailed report helps conservationists take appropriate action.
          </p>
        </form>
      </div>
    </div>
  );
};

const AnimalDetection: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState("mammals");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [detection, setDetection] = useState<DetectionData | null>(null);
  const [videoDetection, setVideoDetection] = useState<DetectionData | null>(null);
  const [liveDetection, setLiveDetection] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoErrorMsg, setVideoErrorMsg] = useState<string | null>(null);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [currentAnimalToReport, setCurrentAnimalToReport] = useState<string | null>(null);
  const [currentDetectionData, setCurrentDetectionData] = useState<DetectionData | null>(null);
  const [activeTab, setActiveTab] = useState<"image" | "video" | "realtime">("image");
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useUser();

  // Check if camera is available
  const isCameraAvailable = typeof navigator !== 'undefined' && 
                           navigator.mediaDevices && 
                           navigator.mediaDevices.getUserMedia;

  const getCurrentUserId = (): number => {
    if (user && user.id) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      return userId;
    } else {
      return 1;
    }
  };

  const getCurrentUsername = (): string => {
    if (user) {
      const username = (user as any).username || (user as any).name || 'Unknown User';
      return username;
    }
    return 'Unknown User';
  };

  const determineUrgency = (detectionData: DetectionData | null): string => {
    if (!detectionData) return "medium";
    const condition = detectionData.condition?.toLowerCase();
    const conservationStatus = detectionData.animal_info?.conservation_status?.toLowerCase();
    
    if (condition?.includes('injured') || condition?.includes('critical')) {
      return "high";
    }
    if (conservationStatus?.includes('critically endangered')) {
      return "high";
    }
    if (conservationStatus?.includes('endangered') || condition?.includes('malnourished')) {
      return "medium";
    }
    if (condition?.includes('healthy') || 
        conservationStatus?.includes('least concern') ||
        conservationStatus?.includes('vulnerable')) {
      return "low";
    }
    return "medium";
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, string> = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    
    const labels: Record<string, string> = {
      high: "🚨 High Urgency",
      medium: "⚠️ Medium Urgency", 
      low: "✅ Low Urgency"
    };
    
    const style = styles[urgency] || styles.medium;
    const label = labels[urgency] || labels.medium;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${style}`}>
        {label}
      </span>
    );
  };

  const openReportForm = (animal: string, detectionData: DetectionData) => {
    setCurrentAnimalToReport(animal);
    setCurrentDetectionData(detectionData);
    setShowReportForm(true);
  };

  const closeReportForm = () => {
    setShowReportForm(false);
    setCurrentAnimalToReport(null);
    setCurrentDetectionData(null);
  };

  // FIXED: Enhanced debugging for report submission
  const handleReportWithDetails = async (formData: FormData) => {
    if (!currentAnimalToReport || !currentDetectionData) {
      alert("⚠️ No detection data to report.");
      return;
    }

    try {
      let imagePath = "";
      let detectionType = "image";
      
      if (detection && detection.class === currentAnimalToReport) {
        imagePath = detection.fullDetectionData?.filename || detection.fullDetectionData?.image_path || "";
        detectionType = "image";
      } else if (videoDetection && videoDetection.class === currentAnimalToReport) {
        imagePath = videoDetection.fullDetectionData?.filename || videoDetection.fullDetectionData?.image_path || "";
        detectionType = "video";
      } else if (liveDetection && liveDetection.class === currentAnimalToReport) {
        detectionType = "real-time";
      }

      const urgency = determineUrgency(currentDetectionData);

      // FIXED: Enhanced debugging
      console.log("🔍 FRONTEND DEBUG: Form data received:");
      console.log("   - date:", formData.date);
      console.log("   - location:", formData.location);
      console.log("   - observerNotes:", formData.observerNotes);
      console.log("   - numberOfAnimals:", formData.numberOfAnimals);
      console.log("   - behavior:", formData.behavior);
      console.log("   - userContact:", formData.userContact);

      // FIXED: Proper structure that matches backend expectations
      const reportData = {
        species: currentAnimalToReport,
        confidence: currentDetectionData?.confidence || 0.8,
        condition: {
          label: currentDetectionData?.condition || "Unknown",
          confidence: currentDetectionData?.conditionConfidence || 0
        },
        image_path: imagePath,
        detection_type: detectionType,
        user_id: getCurrentUserId(),
        animal_info: currentDetectionData?.animal_info || {},
        is_intentional_report: true,
        
        // FIXED: All detailed fields at root level using user inputs
        date_time: formData.date,
        location: formData.location,
        observer_notes: formData.observerNotes,
        urgency: urgency,
        number_of_animals: parseInt(formData.numberOfAnimals) || 1,
        behavior_observed: formData.behavior,
        user_contact: formData.userContact,
        reporter_name: getCurrentUsername()
      };

      console.log("🔍 FRONTEND DEBUG: Full report data being sent:");
      console.log("   - date_time:", reportData.date_time);
      console.log("   - location:", reportData.location);
      console.log("   - observer_notes:", reportData.observer_notes);
      console.log("   - number_of_animals:", reportData.number_of_animals);
      console.log("   - behavior_observed:", reportData.behavior_observed);
      console.log("   - user_contact:", reportData.user_contact);
      console.log("   - urgency:", reportData.urgency);
      console.log("   - reporter_name:", reportData.reporter_name);

      console.log("🔍 Full JSON payload:", JSON.stringify(reportData, null, 2));

      const response = await fetch(`${API_URL}/report-sighting`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Backend response:", result);
      
      setReportMsg(`✅ Detailed report sent successfully for ${currentAnimalToReport}`);
      setTimeout(() => setReportMsg(null), 5000);
      closeReportForm();
    } catch (error: any) {
      console.error("💥 Report error:", error);
      setReportMsg(`❌ Failed to send report: ${error.message}`);
      setTimeout(() => setReportMsg(null), 5000);
    }
  };

  const getTopDetection = (detections: any[]): DetectionData | null => {
    if (!detections || detections.length === 0) return null;
    const topDetection = detections.reduce((prev, current) =>
      prev.confidence > current.confidence ? prev : current
    );
    
    return {
      class: topDetection.class,
      confidence: topDetection.confidence,
      animal_info: topDetection.animal_info,
      condition: topDetection.condition || "Unknown",
      conditionConfidence: topDetection.conditionConfidence || 0
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
      setDetection(null);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMsg("⚠️ Please upload an image before detection.");
      return;
    }

    setLoading(true);
    setDetection(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("model_choice", selectedModel);
    formData.append("user_id", getCurrentUserId().toString());

    try {
      const response = await fetch(`${API_URL}/detect`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.error) {
        setErrorMsg("🚨 " + data.error);
      } else if (data.detections && data.detections.length > 0) {
        const topDetection = getTopDetection(data.detections);

        if (topDetection) {
          const conditionLabel = data.condition?.label || data.condition?.error || "Unknown";
          const conditionConfidence = data.condition?.confidence || 0;

          setDetection({
            ...topDetection,
            condition: conditionLabel,
            conditionConfidence: conditionConfidence,
            fullDetectionData: data
          });
        }

        setReportMsg("🔍 Detection complete. Click 'Report this Sighting' to notify administrators.");
        setTimeout(() => setReportMsg(null), 3000);
      } else {
        setErrorMsg("🔍 No animals detected in the image. Try a different image.");
      }
    } catch (err: any) {
      console.error("💥 Image detection error:", err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setErrorMsg("❌ Cannot connect to backend server. Make sure it's running on 192.168.100.77:5000");
      } else {
        setErrorMsg("❌ Request failed: " + err.message);
      }
    }
    setLoading(false);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
      setVideoPreview(URL.createObjectURL(e.target.files[0]));
      setVideoDetection(null);
      setVideoErrorMsg(null);
    }
  };

  const handleVideoSubmit = async () => {
    if (!videoFile) {
      setVideoErrorMsg("⚠️ Please upload a video before detection.");
      return;
    }

    setVideoLoading(true);
    setVideoDetection(null);
    setVideoErrorMsg(null);

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("model_choice", selectedModel);
    formData.append("user_id", getCurrentUserId().toString());

    try {
      const response = await fetch(`${API_URL}/detect-video`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();

      if (data.error) {
        setVideoErrorMsg("🚨 " + data.error);
      } else if (data.detections && data.detections.length > 0) {
        const topDetection = getTopDetection(data.detections);
        
        if (topDetection) {
          const conditionLabel = data.condition?.label || data.condition?.error || "Unknown";
          const conditionConfidence = data.condition?.confidence || 0;

          setVideoDetection({
            ...topDetection,
            condition: conditionLabel,
            conditionConfidence: conditionConfidence,
            fullDetectionData: data
          });
        }

        setReportMsg("🔍 Detection complete. Click 'Report this Sighting' to notify administrators.");
        setTimeout(() => setReportMsg(null), 3000);
      } else {
        setVideoErrorMsg(" No animals detected in the video.");
      }
    } catch (err: any) {
      console.error("💥 Video detection error:", err);
      setVideoErrorMsg("❌ Video processing failed: " + err.message);
    }
    setVideoLoading(false);
  };

  const startCameraDetection = async () => {
    if (!isCameraAvailable) {
      setCameraError("Camera not available in this environment");
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsCameraActive(true);
      
      detectionIntervalRef.current = setInterval(captureAndDetectFrame, 2000);
      
    } catch (err: any) {
      console.error(" Camera error:", err);
      setCameraError("⚠️ Unable to access camera: " + err.message);
    }
  };

  const stopCameraDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setLiveDetection(null);
    setCameraError(null);
  };

  const captureAndDetectFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        formData.append('model_choice', selectedModel);
        formData.append('user_id', getCurrentUserId().toString());

        const response = await fetch(`${API_URL}/detect-frame`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();

          if (data.detections && data.detections.length > 0) {
            const topDetection = getTopDetection(data.detections);
            
            if (topDetection) {
              const conditionLabel = data.condition?.label || data.condition?.error || "Unknown";
              const conditionConfidence = data.condition?.confidence || 0;

              setLiveDetection({
                ...topDetection,
                condition: conditionLabel,
                conditionConfidence: conditionConfidence,
                fullDetectionData: data
              });
            }
          } else {
            setLiveDetection(null);
          }
        }
      }
    } catch (err) {
      console.error('Frame detection error:', err);
    }
  };

  interface DetectionResultsProps {
    detection: DetectionData;
    type: string;
  }

  const DetectionResults: React.FC<DetectionResultsProps> = ({ detection, type }) => {
    const isHealthy = detection.condition?.toLowerCase() === 'healthy';
    const urgency = determineUrgency(detection);
    
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold text-lg mb-2 text-green-800">
          {type === 'image' ? '' : type === 'video' ? '🎞' : '🎥'} Detection Successful!
        </h3>
        
        <div className="mb-4">
          <h4 className="font-semibold text-md mb-2"> Detection Results:</h4>
          <ul className="space-y-2">
            <li>
              <strong>Animal: </strong>{detection.class}
            </li>
            <li>
              <strong>Condition: </strong>
              <span className={`font-semibold ${
                isHealthy ? 'text-green-600' : 
                detection.condition?.toLowerCase() === 'injured' ? 'text-red-600' : 
                detection.condition?.toLowerCase() === 'malnourished' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {detection.condition}
              </span>
            </li>
            <li>
              <strong>Confidence: </strong>{(detection.confidence * 100).toFixed(1)}%
            </li>
            <li>
              <strong>Urgency Level: </strong>
              {getUrgencyBadge(urgency)}
            </li>
          </ul>
        </div>

        {detection.animal_info && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-md mb-2 text-blue-800">Animal Information:</h4>
            <ul className="space-y-1 text-sm">
              {detection.animal_info.conservation_status && (
                <li>
                  <strong>CONSERVATION STATUS: </strong>
                  {detection.animal_info.conservation_status}
                </li>
              )}
              {detection.animal_info.habitat && (
                <li>
                  <strong>HABITAT: </strong>
                  {detection.animal_info.habitat}
                </li>
              )}
              {detection.animal_info.lifespan && (
                <li>
                  <strong>LIFESPAN: </strong>
                  {detection.animal_info.lifespan}
                </li>
              )}
              {detection.animal_info.population && (
                <li>
                  <strong>POPULATION: </strong>
                  {detection.animal_info.population}
                </li>
              )}
              
              {!isHealthy && detection.animal_info.care_injured && detection.condition?.toLowerCase() === 'injured' && (
                <li>
                  <strong>RECOMMENDED CARE: </strong>
                  {detection.animal_info.care_injured}
                </li>
              )}
              {!isHealthy && detection.animal_info.care_malnourished && detection.condition?.toLowerCase() === 'malnourished' && (
                <li>
                  <strong>RECOMMENDED CARE: </strong>
                  {detection.animal_info.care_malnourished}
                </li>
              )}

              {isHealthy && (
                <li className="text-green-600 font-semibold">
                  ✅ This animal appears to be in good health. No immediate intervention needed.
                </li>
              )}
            </ul>
          </div>
        )}

        {!detection.animal_info && (
          <div className="mt-2 text-sm text-gray-600">
            ℹ️ No additional information available for this species.
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => openReportForm(detection.class, detection)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            📝 Report this Sighting to Admin
          </button>
          <p className="text-xs text-gray-500 mt-2">
            ⓘ Click to provide additional details and send this detection to administrators for review.
          </p>
        </div>
      </div>
    );
  };

  const renderImageTab = () => (
    <div className="p-4 border border-gray-200 rounded-lg">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="mb-4"
      />
      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          className="max-w-sm mt-4 rounded-lg shadow" 
        />
      )}

      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "🔍 Detecting..." : "Detect Animals"}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">{errorMsg}</p>
        </div>
      )}
      {reportMsg && <p className="text-green-600 font-semibold mt-2">{reportMsg}</p>}

      {detection && <DetectionResults detection={detection} type="image" />}
    </div>
  );

  const renderVideoTab = () => (
    <div className="p-4 border border-gray-200 rounded-lg">
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleVideoChange} 
        className="mb-4"
      />
      {videoPreview && (
        <video 
          src={videoPreview} 
          controls 
          className="max-w-sm mt-4 rounded-lg shadow" 
        />
      )}

      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleVideoSubmit} 
          disabled={videoLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {videoLoading ? "🔍 Processing Video..." : "Detect Animals in Video"}
        </button>
      </div>

      {videoErrorMsg && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">{videoErrorMsg}</p>
        </div>
      )}
      {reportMsg && <p className="text-green-600 font-semibold mt-2">{reportMsg}</p>}

      {videoDetection && <DetectionResults detection={videoDetection} type="video" />}
    </div>
  );

  const renderRealTimeTab = () => (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="mb-4">
        {!isCameraActive ? (
          <button
            onClick={startCameraDetection}
            disabled={!isCameraAvailable}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {isCameraAvailable ? "🎥 Start Camera Detection" : "🎥 Camera Not Available"}
          </button>
        ) : (
          <button
            onClick={stopCameraDetection}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            ⏹️ Stop Camera Detection
          </button>
        )}
      </div>

      {cameraError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">{cameraError}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <video 
            ref={videoRef} 
            className="w-full max-w-md rounded-lg shadow"
            muted
            playsInline
          />
          <p className="text-sm text-gray-600 mt-2">
            {isCameraActive 
              ? "🔴 Live camera feed active - detecting animals every 2 seconds..." 
              : isCameraAvailable 
                ? "Camera is off - click Start Camera Detection to begin"
                : "Camera not available in this environment"
            }
          </p>
        </div>

        <div className="flex-1">
          {liveDetection ? (
            <DetectionResults detection={liveDetection} type="real-time" />
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600">
                {isCameraActive 
                  ? "🔍 Looking for animals..." 
                  : isCameraAvailable
                    ? "Start camera detection to begin real-time animal recognition"
                    : "Camera not available - use Image tab instead"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const getTabClass = (tabName: string) => {
    const baseClass = "py-2 px-4 font-medium w-full";
    if (activeTab === tabName) {
      return `${baseClass} border-b-2 border-blue-500 text-blue-600`;
    }
    return `${baseClass} text-gray-500 hover:text-gray-700`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🦉 Animal Detection</h1>

      {user && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            👤 Logged in as: <strong>{getCurrentUsername()}</strong> (ID: {getCurrentUserId()})
          </p>
          <p className="text-xs text-blue-600 mt-1">
            ⓘ Detections are processed locally. Click "Report this Sighting" to notify administrators.
          </p>
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Choose Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="mammals">Mammals</option>
          <option value="birds">Birds</option>
        </select>
      </div>

      <div className="w-full mb-4">
        <div className="grid grid-cols-3 w-full mb-4 border-b">
          <button 
            className={getTabClass("image")}
            onClick={() => setActiveTab("image")}
          >
            📷 Image
          </button>
          <button 
            className={getTabClass("video")}
            onClick={() => setActiveTab("video")}
          >
            🎞 Video
          </button>
          <button 
            className={getTabClass("realtime")}
            onClick={() => setActiveTab("realtime")}
          >
            🎥 Real-Time
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "image" && renderImageTab()}
        {activeTab === "video" && renderVideoTab()}
        {activeTab === "realtime" && renderRealTimeTab()}
      </div>

      <SightingDetailsForm 
        showReportForm={showReportForm}
        currentAnimalToReport={currentAnimalToReport}
        currentDetectionData={currentDetectionData}
        onClose={closeReportForm}
        onSubmit={handleReportWithDetails}
      />

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ How Reporting Works</h3>
        <p className="text-sm text-yellow-700">
          <strong>Step 1:</strong> Run detection to analyze images/videos<br/>
          <strong>Step 2:</strong> Review the detection results<br/>
          <strong>Step 3:</strong> Click "Report this Sighting" to provide additional details and notify administrators
        </p>
      </div>
    </div>
  );
};

export default AnimalDetection;