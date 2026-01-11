'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Camera, 
  CheckCircle, 
  Clock, 
  Download, 
  Eye, 
  EyeOff,
  FileText, 
  Filter, 
  Image as ImageIcon, 
  MapPin, 
  RefreshCw,
  Search, 
  Shield, 
  Tag, 
  Users,
  Video,
  X,
  Zap,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileSpreadsheet,
  Layers,
  Award,
  Heart,
  Star,
  Globe,
  TrendingUp
} from 'lucide-react';

// ✅ FIXED: Use the same API URL as animaldetection.tsx
const API_URL = "http://10.82.64.38:3001";
//const API_URL = "http://192.168.100.77:3001";

// Define the User type and hook return type
interface User {
  id?: string | number;
  name?: string;
  email?: string;
}

interface UseUserReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

// SIMPLIFIED useUser hook
const useUser = (): UseUserReturn => {
  return { 
    user: { id: 1, name: 'Test User', email: 'test@example.com' }, 
    isAuthenticated: true,
    login: async () => {},
    logout: () => {}
  };
};

// ✅ FIXED: Updated Admin History Interface to match backend
interface AdminHistory {
  id: number;
  report_id: number;
  admin_name: string;
  action: string;
  notes: string;
  previous_status: string;
  new_status: string;
  created_at: string;
}

// ✅ ADDED: User Notification Interface (from your backend)
interface UserNotification {
  id: number;
  user_id: number;
  report_id: number;
  message: string;
  status: string;
  admin_notes: string;
  created_at: string;
  is_read: boolean;
  report_data: any;
  species: string;
  confidence: number;
  condition: string;
  condition_confidence: number;
  detection_type: string;
  conservation_status: string;
  habitat: string;
  population: string;
  recommended_care: string;
  image_path: string;
  evidence_images: string[];
  detailed_sighting_data: any;
  sighting_date: string;
  specific_location: string;
  number_of_animals: number;
  behavior_observed: string;
  observer_notes: string;
  urgency_level: string;
  // ✅ ADDED: Character traits field
  character_traits?: string;
}

interface Sighting {
  id: number;
  user_id: number;
  username: string;
  email: string;
  species: string;
  confidence: number;
  condition: string;
  condition_confidence: number;
  detection_type: 'image' | 'video' | 'real-time' | 'manual_report';
  image_path: string | null;
  video_path: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  updated_at: string;
  conservation_status: string;
  habitat: string;
  population: string;
  recommended_care: string;
  admin_notes: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  is_manual_report?: boolean;
  title?: string;
  description?: string;
  report_type?: string;
  detailed_sighting_data?: any;
  sighting_date?: string;
  specific_location?: string;
  number_of_animals?: number;
  behavior_observed?: string;
  observer_notes?: string;
  urgency_level?: string;
  reporter_name?: string;
  evidence_images?: string[];
  // ✅ ADDED: Character traits field
  character_traits?: string;
  // ✅ FIXED: Ensure admin_history is properly typed
  admin_history?: AdminHistory[];
  // ✅ ADDED: Notifications from user_notification table
  notifications?: UserNotification[];
}

type SightingStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
type DetectionType = 'image' | 'video' | 'real-time' | 'manual_report' | 'all';

// ✅ FIXED: Improved ImageWithFallback component with better error handling
const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Reset error state when src changes
  useEffect(() => {
    setImgError(false);
    setLoading(true);
  }, [src]);

  const handleError = () => {
    console.log(`❌ Image failed to load: ${src}`);
    setImgError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    console.log(`✅ Image loaded successfully: ${src}`);
    setLoading(false);
  };

  if (imgError || !src) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-xl`}>
        <div className="text-center">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500 font-medium">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl absolute inset-0 z-10`}>
          <div className="text-center">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-3 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Loading...</p>
          </div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-all duration-300 rounded-xl object-cover`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

// ✅ FIXED: Improved VideoPlayer component with better error handling
const VideoPlayer = ({ src, className }: { src: string; className: string }) => {
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVideoError(false);
    setLoading(true);
  }, [src]);

  const handleError = () => {
    console.log(`❌ Video failed to load: ${src}`);
    setVideoError(true);
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadedData = () => {
    console.log(`✅ Video loaded successfully: ${src}`);
    setLoading(false);
  };

  if (videoError || !src) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-xl`}>
        <div className="text-center">
          <Video className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500 font-medium">Video not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl absolute inset-0 z-10`}>
          <div className="text-center">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-3 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Loading video...</p>
          </div>
        </div>
      )}
      <video 
        src={src}
        controls
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-all duration-300 rounded-xl object-cover`}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || 'An unexpected error occurred while loading your reports.'}
              </p>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function UserReportsHistory() {
  const { user, isAuthenticated } = useUser();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [filterStatus, setFilterStatus] = useState<SightingStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DetectionType>('all');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [filterConservation, setFilterConservation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const [mounted, setMounted] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(false);

  // ✅ FIXED: Use the same API URL as animaldetection.tsx
  const API_BASE_URL = API_URL;

  const [stats, setStats] = useState({
    totalSightings: 0,
    pending: 0,
    resolved: 0,
    endangered: 0,
    imageDetections: 0,
    videoDetections: 0,
    realtimeDetections: 0,
    manualReports: 0,
    uniqueSpecies: 0
  });

  // ✅ FIXED: Set mounted state to handle client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ FIXED: Improved media URL handling function
  const getMediaUrl = (filename: string | null) => {
    if (!filename) return null;
    
    // ✅ FIXED: Handle different filename formats
    if (filename.startsWith('http')) return filename;
    
    // ✅ FIXED: Handle real-time images specifically
    if (filename.includes('real-time') || filename.includes('realtime')) {
      return `${API_BASE_URL}/api/uploaded-images/${filename}`;
    }
    
    // ✅ FIXED: Handle different path formats
    if (filename.startsWith('/')) {
      return `${API_BASE_URL}${filename}`;
    }
    
    if (filename.startsWith('./') || filename.startsWith('../')) {
      return `${API_BASE_URL}/api/uploaded-images/${filename.replace(/^\.\//, '')}`;
    }
    
    // Default path
    return `${API_BASE_URL}/api/uploaded-images/${filename}`;
  };

  // ✅ FIXED: Improved video file detection
  const isVideoFile = (filename: string | null) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // ✅ ADDED: Function to check if notification is from admin (same as notifications page)
  const isAdminNotification = (notification: UserNotification) => {
    return notification.admin_notes || 
           notification.message?.includes('admin') ||
           notification.message?.includes('resolved') ||
           notification.message?.includes('update') ||
           notification.status === 'resolved';
  };

  // ✅ ADDED: Function to render character traits
  const renderCharacterTraits = (sighting: Sighting) => {
    if (!mounted || !sighting.character_traits) return null;

    const traits = sighting.character_traits.split(',').map((trait: string) => trait.trim()).filter(trait => trait);
    
    if (traits.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Star className="w-4 h-4 text-indigo-600" />
          </div>
          <h4 className="text-sm font-semibold text-indigo-800">Character Traits</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {traits.map((trait: string, index: number) => (
            <span 
              key={index}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 shadow-sm"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ✅ FIXED: Function to render detailed sighting information
  const renderDetailedSightingInfo = (sighting: Sighting) => {
    if (!mounted) return null;

    const detailedData = sighting.detailed_sighting_data || {};
    
    const sightingDate = sighting.sighting_date || detailedData.sighting_date;
    const specificLocation = sighting.specific_location || detailedData.specific_location;
    const numberOfAnimals = sighting.number_of_animals !== undefined ? sighting.number_of_animals : 
                           detailedData.number_of_animals;
    const behaviorObserved = sighting.behavior_observed || detailedData.behavior_observed;
    const observerNotes = sighting.observer_notes || detailedData.observer_notes;
    const urgencyLevel = sighting.urgency_level || detailedData.urgency_level;
    const reporterName = sighting.reporter_name || detailedData.reporter_name;

    const hasDetailedData = sightingDate || 
                           specificLocation || 
                           numberOfAnimals !== undefined || 
                           behaviorObserved || 
                           observerNotes || 
                           urgencyLevel || 
                           reporterName;

    if (!hasDetailedData) {
      return (
        <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-green-800">Sighting Details</h4>
          </div>
          <p className="text-sm text-green-600 text-center py-3">No detailed sighting information available.</p>
        </div>
      );
    }

    const getUrgencyIcon = (level: string) => {
      switch(level?.toLowerCase()) {
        case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
        case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        default: return <AlertTriangle className="w-4 h-4 text-green-500" />;
      }
    };

    return (
      <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="text-sm font-semibold text-green-800">Sighting Details</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sightingDate && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Sighting Date</p>
                <p className="text-sm text-green-800 font-semibold">
                  {new Date(sightingDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
          {specificLocation && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Location</p>
                <p className="text-sm text-green-800 font-semibold">{specificLocation}</p>
              </div>
            </div>
          )}
          {numberOfAnimals !== undefined && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Animal Count</p>
                <p className="text-sm text-green-800 font-semibold">{numberOfAnimals}</p>
              </div>
            </div>
          )}
          {behaviorObserved && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Behavior</p>
                <p className="text-sm text-green-800 font-semibold">{behaviorObserved}</p>
              </div>
            </div>
          )}
          {urgencyLevel && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                {getUrgencyIcon(urgencyLevel)}
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Priority</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    urgencyLevel === 'critical' ? 'text-red-700' :
                    urgencyLevel === 'high' ? 'text-orange-700' :
                    urgencyLevel === 'medium' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {urgencyLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
          {reporterName && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Reporter</p>
                <p className="text-sm text-green-800 font-semibold">{reporterName}</p>
              </div>
            </div>
          )}
          {observerNotes && (
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-600 font-medium">Observer Notes</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 leading-relaxed">{observerNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ FIXED: Improved evidence media rendering with better error handling
  const renderEvidenceMedia = (sighting: Sighting) => {
    if (!mounted) return null;

    const mediaToShow = [];
    
    // Add main image if it exists
    if (sighting.image_path) {
      mediaToShow.push(sighting.image_path);
    }
    
    // Add evidence images that are different from main image
    if (sighting.evidence_images) {
      sighting.evidence_images.forEach((img: string) => {
        if (!sighting.image_path || img !== sighting.image_path) {
          mediaToShow.push(img);
        }
      });
    }
    
    // Only render if we have media to show
    if (mediaToShow.length === 0) return null;

    return (
      <div className="mt-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Report Evidence</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaToShow.map((media: string, index: number) => {
            const mediaUrl = getMediaUrl(media);
            console.log(`🖼️ Rendering evidence media ${index}:`, { media, mediaUrl });
            
            return (
              <div key={index} className="group relative">
                {isVideoFile(media) ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-all duration-300">
                    <VideoPlayer 
                      src={mediaUrl!}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-all duration-300">
                    <ImageWithFallback 
                      src={mediaUrl!}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ✅ FIXED: Function to fetch notifications for a report
  const fetchReportNotifications = async (reportId: number): Promise<UserNotification[]> => {
    try {
      console.log(`📨 Fetching notifications for report ${reportId}`);
      const response = await fetch(`${API_BASE_URL}/api/user/notifications?user_id=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const reportNotifications = data.notifications?.filter((notification: UserNotification) => 
          notification.report_id === reportId
        ) || [];
        
        console.log(`✅ Found ${reportNotifications.length} notifications for report ${reportId}`);
        return reportNotifications;
      }
      console.log(`❌ Failed to fetch notifications for report ${reportId}`);
      return [];
    } catch (error) {
      console.error(`❌ Error fetching notifications for report ${reportId}:`, error);
      return [];
    }
  };

  // ✅ FIXED: Function to render admin history - NOW PROPERLY DEDUPLICATED AND TYPED
  const renderAdminHistory = (sighting: Sighting) => {
    if (!mounted) return null;

    interface AdminHistoryItem {
      type: 'admin_note' | 'admin_history' | 'notification';
      id: string;
      admin_name: string;
      action: string;
      notes: string;
      created_at: string;
      previous_status: string;
      new_status: string;
    }

    const allAdminItems: AdminHistoryItem[] = [];
    const seenItems = new Set<string>();

    // Add admin notes from report table (only if not empty)
    if (sighting.admin_notes && sighting.admin_notes.trim()) {
      const adminNoteKey = `admin_note_${sighting.id}_${sighting.admin_notes.substring(0, 50)}`;
      if (!seenItems.has(adminNoteKey)) {
        allAdminItems.push({
          type: 'admin_note',
          id: `admin_note_${sighting.id}`,
          admin_name: 'Wildlife Conservation Team',
          action: 'review',
          notes: sighting.admin_notes,
          created_at: sighting.updated_at,
          previous_status: '',
          new_status: sighting.status
        });
        seenItems.add(adminNoteKey);
      }
    }

    // Add admin history items
    if (sighting.admin_history && sighting.admin_history.length > 0) {
      sighting.admin_history.forEach((history: AdminHistory) => {
        const historyKey = `admin_history_${history.id}_${history.notes?.substring(0, 50) || ''}`;
        if (!seenItems.has(historyKey)) {
          allAdminItems.push({
            type: 'admin_history',
            id: `admin_history_${history.id}`,
            admin_name: history.admin_name || 'Wildlife Conservation Team',
            action: history.action || 'review',
            notes: history.notes || '',
            created_at: history.created_at,
            previous_status: history.previous_status || '',
            new_status: history.new_status || sighting.status
          });
          seenItems.add(historyKey);
        }
      });
    }

    // ✅ ADDED: Add notifications from user_notification table (only admin ones)
    if (sighting.notifications && sighting.notifications.length > 0) {
      sighting.notifications.forEach((notification: UserNotification) => {
        const hasAdminContent = notification.admin_notes && notification.admin_notes.trim();
        const isFromAdmin = isAdminNotification(notification);
        
        if ((hasAdminContent || isFromAdmin) && notification.admin_notes) {
          const notificationKey = `notification_${notification.id}_${notification.admin_notes.substring(0, 50)}`;
          
          const isDuplicate = allAdminItems.some(item => 
            item.notes === notification.admin_notes && 
            new Date(item.created_at).getTime() === new Date(notification.created_at).getTime()
          );
          
          if (!seenItems.has(notificationKey) && !isDuplicate) {
            allAdminItems.push({
              type: 'notification',
              id: `notification_${notification.id}`,
              admin_name: 'Wildlife Conservation Team',
              action: 'notification',
              notes: notification.admin_notes,
              created_at: notification.created_at,
              previous_status: '',
              new_status: notification.status || sighting.status
            });
            seenItems.add(notificationKey);
          }
        }
      });
    }

    // Sort by creation date (newest first)
    allAdminItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (allAdminItems.length === 0) {
      return (
        <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-sm font-semibold text-purple-800">Admin Review History</h4>
          </div>
          <p className="text-sm text-purple-600 text-center py-3">No admin review history yet.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-800">Admin Review History</h4>
              <p className="text-xs text-purple-600">{allAdminItems.length} entries</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {allAdminItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'notification' ? 'bg-blue-100' :
                    item.type === 'admin_history' ? 'bg-purple-100' :
                    'bg-green-100'
                  }`}>
                    {item.type === 'notification' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.admin_name}</p>
                    <p className={`text-xs font-medium ${
                      item.type === 'notification' ? 'text-blue-600' :
                      item.type === 'admin_history' ? 'text-purple-600' :
                      'text-green-600'
                    }`}>
                      {item.action.replace('_', ' ')}
                      {item.type === 'notification' && ' (Notification)'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {item.previous_status && item.new_status && (
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    {item.previous_status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.new_status === 'resolved' ? 'bg-green-100 text-green-800' :
                    item.new_status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                    item.new_status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.new_status.replace('_', ' ')}
                  </span>
                </div>
              )}
              
              {item.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {item.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ FIXED: Get user ID from localStorage - only on client side
  useEffect(() => {
    if (!mounted) return;

    const findUserId = () => {
      const possibleUserKeys = ['currentUser', 'user', 'userData', 'userId'];
      
      for (const key of possibleUserKeys) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            const userData = JSON.parse(storedData);
            const foundUserId = userData.id || userData.user_id || userData.userId;
            if (foundUserId) {
              return Number(foundUserId);
            }
          } catch (error) {
            const userId = parseInt(storedData);
            if (!isNaN(userId)) {
              return userId;
            }
          }
        }
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const urlUserId = urlParams.get('user_id');
      if (urlUserId) {
        return Number(urlUserId);
      }
      
      return 1;
    };

    const foundUserId = findUserId();
    setUserId(foundUserId);
  }, [mounted]);

  // ✅ FIXED: Fetch user reports with PROPER admin history data AND notifications
  useEffect(() => {
    if (!userId || !mounted) return;

    const fetchUserReports = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(`Fetching user reports from: ${API_BASE_URL}`);
        
        console.log(`🔍 Fetching reports for user ${userId} from ${API_BASE_URL}/api/user/${userId}/reports`);
        
        const reportsResponse = await fetch(`${API_BASE_URL}/api/user/${userId}/reports`);
        
        let allSightings: Sighting[] = [];

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          console.log('📋 Raw reports data:', reportsData);
          
          if (reportsData.reports && Array.isArray(reportsData.reports)) {
            // ✅ FIXED: Fetch notifications for each report
            const reportsWithNotifications = await Promise.all(
              reportsData.reports.map(async (report: any) => {
                console.log(`🔍 Processing report ${report.id}:`, report);
                
                const notifications = await fetchReportNotifications(report.id);
                
                const detailedSightingData = report.detailed_sighting_data || {};
                
                // ✅ FIXED: Ensure admin_history is properly extracted
                const adminHistory = report.admin_history || [];
                
                console.log(`📝 Report ${report.id} - Admin history:`, adminHistory);
                console.log(`📝 Report ${report.id} - Notifications:`, notifications);
                
                return {
                  id: report.id,
                  user_id: report.user_id || userId,
                  username: report.user_name || 'You',
                  email: report.user_email || user?.email || '',
                  species: report.species || 'Unknown Species',
                  confidence: report.confidence || 0,
                  condition: report.condition || 'Unknown',
                  condition_confidence: report.condition_confidence || 0,
                  detection_type: report.detection_type || 'manual_report',
                  image_path: report.image_path,
                  video_path: report.video_path || null,
                  location_lat: report.location_lat,
                  location_lng: report.location_lng,
                  created_at: report.created_at || new Date().toISOString(),
                  updated_at: report.updated_at || report.created_at || new Date().toISOString(),
                  conservation_status: report.conservation_status || '',
                  habitat: report.habitat || '',
                  population: report.population || '',
                  recommended_care: report.recommended_care || '',
                  admin_notes: report.admin_notes || '',
                  status: report.status || 'pending',
                  is_manual_report: report.is_manual_report !== undefined ? report.is_manual_report : true,
                  title: report.title || `Report: ${report.species || 'Unknown Species'}`,
                  description: report.description || 'No description available',
                  report_type: report.report_type || 'sighting',
                  
                  // ✅ ADDED: Character traits from database
                  character_traits: report.character_traits || null,
                  
                  // ✅ FIXED: Ensure detailed sighting data is properly extracted
                  detailed_sighting_data: detailedSightingData,
                  
                  // ✅ FIXED: Direct fields with proper fallbacks
                  sighting_date: report.sighting_date || detailedSightingData.sighting_date,
                  specific_location: report.specific_location || detailedSightingData.specific_location,
                  number_of_animals: report.number_of_animals !== undefined ? report.number_of_animals : 
                                    (detailedSightingData.number_of_animals !== undefined ? detailedSightingData.number_of_animals : 1),
                  behavior_observed: report.behavior_observed || detailedSightingData.behavior_observed,
                  observer_notes: report.observer_notes || detailedSightingData.observer_notes,
                  urgency_level: report.urgency_level || detailedSightingData.urgency_level || 'medium',
                  reporter_name: report.reporter_name || detailedSightingData.reporter_name,
                  evidence_images: report.evidence_images || detailedSightingData.evidence_images || [],
                  
                  // ✅ FIXED: Properly assign admin_history from the API response
                  admin_history: adminHistory,
                  
                  // ✅ ADDED: Include notifications from user_notification table
                  notifications: notifications
                };
              })
            );
            
            allSightings = [...reportsWithNotifications];
          }
        } else {
          throw new Error(`Failed to fetch reports: ${reportsResponse.status} - ${reportsResponse.statusText}`);
        }

        console.log('✅ Final processed sightings:', allSightings);
        setSightings(allSightings);
        calculateStats(allSightings);
        setDebugInfo(`✅ Success: ${allSightings.length} reports loaded from ${API_BASE_URL}`);
        
      } catch (error) {
        console.error('❌ Error fetching user reports:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch reports from database');
        setDebugInfo(`❌ Error loading data from ${API_BASE_URL}`);
        setSightings([]);
        calculateStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [userId, API_BASE_URL, mounted]);

  const calculateStats = (sightingsList: Sighting[]) => {
    const uniqueSpecies = new Set(sightingsList.map(s => s.species));
    const endangeredCount = sightingsList.filter(s => 
      s.conservation_status && 
      ['Endangered', 'Critically Endangered', 'Vulnerable'].includes(s.conservation_status)
    ).length;

    setStats({
      totalSightings: sightingsList.length,
      pending: sightingsList.filter(s => s.status === 'pending').length,
      resolved: sightingsList.filter(s => s.status === 'resolved').length,
      endangered: endangeredCount,
      imageDetections: sightingsList.filter(s => s.detection_type === 'image').length,
      videoDetections: sightingsList.filter(s => s.detection_type === 'video').length,
      realtimeDetections: sightingsList.filter(s => s.detection_type === 'real-time').length,
      manualReports: sightingsList.filter(s => s.is_manual_report).length,
      uniqueSpecies: uniqueSpecies.size
    });
  };

  // Filter sightings based on current filters
  const getFilteredSightings = () => {
    return sightings.filter(sighting => {
      const statusMatch = filterStatus === 'all' || sighting.status === filterStatus;
      const typeMatch = filterType === 'all' || sighting.detection_type === filterType;
      const speciesMatch = filterSpecies === 'all' || sighting.species === filterSpecies;
      const conservationMatch = filterConservation === 'all' || sighting.conservation_status === filterConservation;
      
      const searchMatch = !searchTerm || 
        sighting.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sighting.description && sighting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sighting.habitat && sighting.habitat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sighting.specific_location && sighting.specific_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sighting.character_traits && sighting.character_traits.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const sightingDate = new Date(sighting.created_at);
      const dateMatch = (!dateRange.start || sightingDate >= new Date(dateRange.start)) &&
                       (!dateRange.end || sightingDate <= new Date(dateRange.end + 'T23:59:59'));

      return statusMatch && typeMatch && speciesMatch && conservationMatch && searchMatch && dateMatch;
    });
  };

  // Helper functions
  const getStatusColor = (status: SightingStatus) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: SightingStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'dismissed': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConservationColor = (status?: string) => {
    if (!status) return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'critically endangered': return 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200';
      case 'endangered': return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-200';
      case 'vulnerable': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200';
      case 'near threatened': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200';
      case 'least concern': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getDetectionTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200';
      case 'video': return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border-purple-200';
      case 'real-time': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200';
      case 'manual_report': return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getDetectionTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Camera className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'real-time': return <Zap className="w-4 h-4" />;
      case 'manual_report': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const hasMedia = (sighting: Sighting) => {
    return !!(sighting.image_path || sighting.video_path || (sighting.evidence_images && sighting.evidence_images.length > 0));
  };

  // ✅ FIXED: Improved media preview with better real-time image handling
  const getMediaPreview = (sighting: Sighting) => {
    // ✅ FIXED: Check evidence images first
    if (sighting.evidence_images && sighting.evidence_images.length > 0) {
      const firstEvidence = sighting.evidence_images[0];
      const mediaUrl = getMediaUrl(firstEvidence);
      if (mediaUrl) {
        if (isVideoFile(firstEvidence)) {
          return (
            <div className="relative group">
              <VideoPlayer 
                src={mediaUrl} 
                className="w-full h-40 object-cover rounded-xl"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" />
                Video
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          );
        } else {
          return (
            <div className="relative group">
              <ImageWithFallback 
                src={mediaUrl}
                alt={`Evidence of ${sighting.species}`}
                className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          );
        }
      }
    }

    // ✅ FIXED: Then check main image path
    const mediaPath = sighting.video_path || sighting.image_path;
    if (!mediaPath) return null;

    const mediaUrl = getMediaUrl(mediaPath);
    if (!mediaUrl) return null;

    console.log(`🖼️ Rendering media preview for ${sighting.detection_type}:`, { mediaPath, mediaUrl });

    if (isVideoFile(mediaPath) || sighting.video_path) {
      return (
        <div className="relative group">
          <VideoPlayer 
            src={mediaUrl} 
            className="w-full h-40 object-cover rounded-xl"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Video className="w-3 h-3" />
            Video
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </div>
      );
    } else {
      return (
        <div className="relative group">
          <ImageWithFallback 
            src={mediaUrl}
            alt={`Detection of ${sighting.species}`}
            className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </div>
      );
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      const filteredSightings = getFilteredSightings();
      
      if (filteredSightings.length === 0) {
        alert('No reports to export with current filters.');
        return;
      }
      
      const csvHeaders = [
        'ID',
        'Species',
        'Confidence',
        'Condition',
        'Condition Confidence',
        'Detection Type',
        'Location',
        'Timestamp',
        'Conservation Status',
        'Habitat',
        'Population',
        'Status',
        'Report Type',
        'Specific Location',
        'Number of Animals',
        'Behavior Observed',
        'Urgency Level',
        'Character Traits',
        'Admin Notes'
      ].join(',');

      const csvRows = filteredSightings.map(sighting => [
        sighting.id,
        `"${sighting.species}"`,
        (sighting.confidence * 100).toFixed(1) + '%',
        sighting.condition,
        sighting.condition_confidence + '%',
        sighting.detection_type,
        sighting.location_lat && sighting.location_lng 
          ? `"${sighting.location_lat}, ${sighting.location_lng}"`
          : 'N/A',
        `"${new Date(sighting.created_at).toLocaleString()}"`,
        sighting.conservation_status || 'N/A',
        `"${sighting.habitat || 'N/A'}"`,
        `"${sighting.population || 'N/A'}"`,
        sighting.status,
        sighting.report_type || 'N/A',
        `"${sighting.specific_location || 'N/A'}"`,
        sighting.number_of_animals || 'N/A',
        `"${sighting.behavior_observed || 'N/A'}"`,
        sighting.urgency_level || 'N/A',
        `"${sighting.character_traits || 'N/A'}"`,
        `"${sighting.admin_notes || 'N/A'}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      link.download = `my-wildlife-reports-${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredSightings = getFilteredSightings();
  const uniqueSpecies = Array.from(new Set(sightings.map(s => s.species))).sort();
  const uniqueConservation = Array.from(new Set(sightings.map(s => s.conservation_status).filter(Boolean))).sort();
  const uniqueTypes = Array.from(new Set(sightings.map(s => s.detection_type))).sort();

  // ✅ FIXED: Show loading state that works with SSR
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading your reports...</p>
              <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!userId && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
              <EyeOff className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h1>
            <p className="text-gray-600 mb-8">Please log in to view your wildlife reports.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-700 to-teal-800 text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">My Wildlife Reports</h1>
                  <p className="text-emerald-100 mt-1">
                    Track, filter, and manage all your wildlife sighting reports
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium flex items-center gap-2 border border-white/30"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={exportLoading || filteredSightings.length === 0}
                  className={`px-5 py-2.5 bg-white text-emerald-700 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 ${
                    exportLoading || filteredSightings.length === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-emerald-50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {exportLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      Export CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          {/* Stats Cards */}
          {stats.totalSightings > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSightings}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Resolved</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Image</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">{stats.imageDetections}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Manual</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.manualReports}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Species</p>
                    <p className="text-3xl font-bold text-teal-600 mt-2">{stats.uniqueSpecies}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">Connection Error</h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Section */}
          {sightings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setExpandedFilters(!expandedFilters)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Filter & Search Reports</h3>
                      <p className="text-sm text-gray-500">
                        Showing {filteredSightings.length} of {sightings.length} reports
                      </p>
                    </div>
                  </div>
                  {expandedFilters ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedFilters && (
                <div className="p-6 border-t border-gray-100">
                  {/* Quick Search */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-5 h-5 text-gray-500" />
                      <label className="text-sm font-medium text-gray-700">Search Reports</label>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by species, description, habitat, location, traits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Species</label>
                      </div>
                      <select
                        value={filterSpecies}
                        onChange={(e) => setFilterSpecies(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="all">All Species</option>
                        {uniqueSpecies.map(species => (
                          <option key={species} value={species}>{species}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Detection Type</label>
                      </div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as DetectionType)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="all">All Types</option>
                        {uniqueTypes.map(type => (
                          <option key={type} value={type}>
                            {type === 'manual_report' ? 'Manual Report' : type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Conservation</label>
                      </div>
                      <select
                        value={filterConservation}
                        onChange={(e) => setFilterConservation(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="all">All Status</option>
                        {uniqueConservation.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Status</label>
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as SightingStatus | 'all')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Date From</label>
                      </div>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Date To</label>
                      </div>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports List */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Reports</h2>
                <p className="text-gray-600 mt-1">
                  {filteredSightings.length === 0 
                    ? "No reports to display" 
                    : `${filteredSightings.length} report${filteredSightings.length !== 1 ? 's' : ''} found`
                  }
                </p>
              </div>
              
              {sightings.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.href = '/report'}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    New Report
                  </button>
                </div>
              )}
            </div>

            {filteredSightings.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {sightings.length === 0 ? "No reports yet" : "No reports found"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {sightings.length === 0 
                    ? "You haven't submitted any wildlife reports yet. Start by submitting your first sighting report."
                    : "No reports match your current filters. Try adjusting your search or filters."
                  }
                </p>
                <button
                  onClick={() => window.location.href = '/animal-detection'}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Submit Your First Report
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSightings.map((sighting) => (
                  <div
                    key={sighting.id}
                    className={`bg-white rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                      selectedSighting?.id === sighting.id 
                        ? 'border-blue-500 ring-2 ring-blue-100 transform scale-[1.02]' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedSighting(sighting)}
                  >
                    {/* Media Preview */}
                    {hasMedia(sighting) && (
                      <div className="relative">
                        {getMediaPreview(sighting)}
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(sighting.status)}`}>
                            {getStatusIcon(sighting.status)}
                            {sighting.status.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${getDetectionTypeColor(sighting.detection_type)}`}>
                            {getDetectionTypeIcon(sighting.detection_type)}
                            {sighting.detection_type === 'manual_report' ? 'Manual Report' : sighting.detection_type}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 truncate">{sighting.species}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {!hasMedia(sighting) && (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(sighting.status)}`}>
                                {getStatusIcon(sighting.status)}
                                {sighting.status.replace('_', ' ')}
                              </span>
                            )}
                            {sighting.conservation_status && (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getConservationColor(sighting.conservation_status)}`}>
                                {sighting.conservation_status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Report ID</p>
                          <p className="font-mono font-bold text-gray-900">#{sighting.id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Condition</p>
                            <p className="font-semibold text-gray-900 capitalize">{sighting.condition}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Confidence</p>
                            <p className="font-semibold text-green-700">{(sighting.confidence * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                      
                      {sighting.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{sighting.description}</p>
                      )}
                      
                      {sighting.specific_location && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-600 truncate">{sighting.specific_location}</span>
                        </div>
                      )}
                      
                      {sighting.number_of_animals !== undefined && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">
                            {sighting.number_of_animals} animal{sighting.number_of_animals !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      
                      {sighting.urgency_level && sighting.urgency_level !== 'medium' && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className={`font-medium ${
                            sighting.urgency_level === 'critical' ? 'text-red-600' :
                            sighting.urgency_level === 'high' ? 'text-orange-600' :
                            'text-yellow-600'
                          }`}>
                            {sighting.urgency_level} priority
                          </span>
                        </div>
                      )}
                      
                      {/* Character traits preview */}
                      {sighting.character_traits && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <Star className="w-4 h-4 text-indigo-500" />
                          <span className="text-indigo-600 truncate">
                            Traits: {sighting.character_traits.split(',').slice(0, 2).join(', ')}
                            {sighting.character_traits.split(',').length > 2 && '...'}
                          </span>
                        </div>
                      )}
                      
                      {/* Admin notes preview */}
                      {(sighting.admin_notes || (sighting.notifications && sighting.notifications.some(n => n.admin_notes))) && (
                        <div className="flex items-center gap-2 mb-4 text-sm">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="text-purple-600 truncate">
                            Admin: {sighting.admin_notes ? 
                              sighting.admin_notes.substring(0, 40) + (sighting.admin_notes.length > 40 ? '...' : '') :
                              sighting.notifications?.find(n => n.admin_notes)?.admin_notes?.substring(0, 40) + '...'
                            }
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(sighting.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasMedia(sighting) && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              {isVideoFile(sighting.image_path) || sighting.video_path ? (
                                <>
                                  <Video className="w-3 h-3" />
                                  Video
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3 h-3" />
                                  Image
                                </>
                              )}
                            </span>
                          )}
                          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Detail Modal */}
        {selectedSighting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Report Details</h2>
                    <p className="text-emerald-100 mt-1">Comprehensive view of your wildlife report</p>
                  </div>
                  <button
                    onClick={() => setSelectedSighting(null)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                <div className="space-y-6">
                  {/* Main Media */}
                  {hasMedia(selectedSighting) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {isVideoFile(selectedSighting.image_path) || selectedSighting.video_path ? (
                          <>
                            <Video className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Detection Video</h3>
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Detection Image</h3>
                          </>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl">
                        {isVideoFile(selectedSighting.image_path) || selectedSighting.video_path ? (
                          <VideoPlayer 
                            src={getMediaUrl(selectedSighting.video_path || selectedSighting.image_path)!}
                            className="w-full h-96 rounded-xl"
                          />
                        ) : (
                          <ImageWithFallback 
                            src={getMediaUrl(selectedSighting.image_path)!}
                            alt={`Detection of ${selectedSighting.species}`}
                            className="w-full h-96 rounded-xl"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Evidence Media */}
                  {renderEvidenceMedia(selectedSighting)}

                  {/* Animal Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Animal Information</h3>
                        <p className="text-sm text-blue-600">Detailed species data and analysis</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Species</p>
                            <p className="font-bold text-lg text-gray-900">{selectedSighting.species}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Condition</p>
                            <p className="font-bold text-lg text-gray-900 capitalize">{selectedSighting.condition}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Confidence</p>
                            <div className="flex items-baseline gap-2">
                              <p className="font-bold text-2xl text-green-700">{(selectedSighting.confidence * 100).toFixed(1)}%</p>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                  style={{ width: `${selectedSighting.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            {getDetectionTypeIcon(selectedSighting.detection_type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Detection Type</p>
                            <p className="font-bold text-lg text-gray-900 capitalize">
                              {selectedSighting.detection_type === 'manual_report' ? 'Manual Report' : selectedSighting.detection_type}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            {getStatusIcon(selectedSighting.status)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className={`font-bold text-lg ${getStatusColor(selectedSighting.status).split(' ')[2]}`}>
                              {selectedSighting.status.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Reported</p>
                            <p className="font-bold text-lg text-gray-900">
                              {new Date(selectedSighting.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Character Traits in Detail */}
                    {selectedSighting.character_traits && (
                      <div className="mt-6">
                        {renderCharacterTraits(selectedSighting)}
                      </div>
                    )}
                    
                    {/* GPS Location */}
                    {selectedSighting.location_lat && selectedSighting.location_lng && (
                      <div className="mt-6 bg-white p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">GPS Location</p>
                            <p className="font-mono font-bold text-lg text-gray-900">
                              {selectedSighting.location_lat.toFixed(6)}, {selectedSighting.location_lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conservation Info */}
                    {(selectedSighting.conservation_status || selectedSighting.habitat || selectedSighting.population || selectedSighting.recommended_care) && (
                      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Conservation Information</h4>
                            <p className="text-sm text-green-600">Species protection and care details</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedSighting.conservation_status && (
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                              <p className="text-sm text-gray-600 mb-1">Conservation Status</p>
                              <span className={`font-bold text-lg ${getConservationColor(selectedSighting.conservation_status).split(' ')[2]}`}>
                                {selectedSighting.conservation_status}
                              </span>
                            </div>
                          )}
                          
                          {selectedSighting.habitat && (
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                              <p className="text-sm text-gray-600 mb-1">Habitat</p>
                              <p className="font-bold text-lg text-gray-900">{selectedSighting.habitat}</p>
                            </div>
                          )}
                          
                          {selectedSighting.population && (
                            <div className="bg-white p-4 rounded-lg border border-green-100">
                              <p className="text-sm text-gray-600 mb-1">Population</p>
                              <p className="font-bold text-lg text-gray-900">{selectedSighting.population}</p>
                            </div>
                          )}
                          
                          {selectedSighting.recommended_care && (
                            <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 mt-2">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-blue-600" />
                                <p className="font-semibold text-blue-800">Recommended Care</p>
                              </div>
                              <p className="text-blue-900">{selectedSighting.recommended_care}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Manual Report Details */}
                    {selectedSighting.is_manual_report && selectedSighting.title && (
                      <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Manual Report Details</h4>
                            <p className="text-sm text-orange-600">User-submitted report information</p>
                          </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-orange-100">
                          <h5 className="font-bold text-gray-900 mb-2">{selectedSighting.title}</h5>
                          {selectedSighting.description && (
                            <p className="text-gray-700">{selectedSighting.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Sighting Information */}
                  {renderDetailedSightingInfo(selectedSighting)}

                  {/* Admin History */}
                  {renderAdminHistory(selectedSighting)}

                  {/* Non-deletable Notice */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                        <p className="text-sm text-yellow-700">
                          This report cannot be deleted. Please contact the administrator if you believe there is an error.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}