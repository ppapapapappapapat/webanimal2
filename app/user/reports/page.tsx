'use client';

import React, { useState, useEffect } from 'react';

// ✅ FIXED: Use the same API URL as animaldetection.tsx
const API_URL = "http://192.168.100.77:5000";

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
  // ✅ FIXED: Ensure admin_history is properly typed
  admin_history?: AdminHistory[];
  // ✅ ADDED: Notifications from user_notification table
  notifications?: UserNotification[];
}

type SightingStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
type DetectionType = 'image' | 'video' | 'real-time' | 'manual_report' | 'all';

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-md`}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

const VideoPlayer = ({ src, className }: { src: string; className: string }) => {
  if (!src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-md`}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Video not available</p>
        </div>
      </div>
    );
  }

  return (
    <video 
      src={src}
      controls
      className={className}
    >
      Your browser does not support the video tag.
    </video>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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

  // ✅ ADDED: Function to check if notification is from admin (same as notifications page)
  const isAdminNotification = (notification: UserNotification) => {
    return notification.admin_notes || 
           notification.message?.includes('admin') ||
           notification.message?.includes('resolved') ||
           notification.message?.includes('update') ||
           notification.status === 'resolved';
  };

  // ✅ ADDED: Helper functions for media (same as notifications page)
  const getMediaUrl = (filename: string | null) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${API_BASE_URL}/api/uploaded-images/${filename}`;
  };

  const isVideoFile = (filename: string | null) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
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
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-700 mb-3">Report Sighting Details</h4>
          <p className="text-sm text-green-600 text-center">No detailed sighting information available.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-medium text-green-700 mb-3">Report Sighting Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
          {sightingDate && (
            <div>
              <span className="font-medium">Sighting Date:</span>
              <span className="ml-1">
                {new Date(sightingDate).toLocaleString()}
              </span>
            </div>
          )}
          {specificLocation && (
            <div>
              <span className="font-medium">Specific Location:</span>
              <span className="ml-1">{specificLocation}</span>
            </div>
          )}
          {numberOfAnimals !== undefined && (
            <div>
              <span className="font-medium">Number of Animals:</span>
              <span className="ml-1">{numberOfAnimals}</span>
            </div>
          )}
          {behaviorObserved && (
            <div>
              <span className="font-medium">Behavior Observed:</span>
              <span className="ml-1">{behaviorObserved}</span>
            </div>
          )}
          {urgencyLevel && (
            <div>
              <span className="font-medium">Urgency Level:</span>
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {urgencyLevel}
              </span>
            </div>
          )}
          {reporterName && (
            <div>
              <span className="font-medium">Reporter Name:</span>
              <span className="ml-1">{reporterName}</span>
            </div>
          )}
          {observerNotes && (
            <div className="md:col-span-2">
              <span className="font-medium">Observer Notes:</span>
              <p className="mt-1 bg-white p-2 rounded border border-green-200 whitespace-pre-wrap">
                {observerNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ ADDED: Function to render evidence media (same as notifications page)
  const renderEvidenceMedia = (sighting: Sighting) => {
    if (!mounted) return null;

    const mediaToShow = [];
    
    // Add main image if it exists
    if (sighting.image_path) {
      mediaToShow.push(sighting.image_path);
    }
    
    // Add evidence images that are different from main image
    if (sighting.evidence_images) {
      sighting.evidence_images.forEach(img => {
        if (!sighting.image_path || img !== sighting.image_path) {
          mediaToShow.push(img);
        }
      });
    }
    
    // Only render if we have media to show
    return mediaToShow.length > 0 ? (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Reported Evidence:</h4>
        <div className="flex gap-2 overflow-x-auto">
          {mediaToShow.map((media, index) => (
            isVideoFile(media) ? (
              <video 
                key={index}
                src={getMediaUrl(media)!}
                className="h-32 w-32 object-cover rounded-md border border-gray-300"
                controls
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                key={index}
                src={getMediaUrl(media)!}
                alt={`Evidence ${index + 1}`}
                className="h-32 w-32 object-cover rounded-md border border-gray-300"
              />
            )
          ))}
        </div>
      </div>
    ) : null;
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

  // ✅ FIXED: Function to render admin history - NOW INCLUDES NOTIFICATIONS
  const renderAdminHistory = (sighting: Sighting) => {
    if (!mounted) return null;

    const allAdminItems = [];

    // Add admin notes from report table
    if (sighting.admin_notes) {
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
    }

    // Add admin history items
    if (sighting.admin_history && sighting.admin_history.length > 0) {
      sighting.admin_history.forEach(history => {
        allAdminItems.push({
          type: 'admin_history',
          ...history
        });
      });
    }

    // ✅ ADDED: Add notifications from user_notification table
    if (sighting.notifications && sighting.notifications.length > 0) {
      sighting.notifications.forEach(notification => {
        if (notification.admin_notes || isAdminNotification(notification)) {
          allAdminItems.push({
            type: 'notification',
            id: `notification_${notification.id}`,
            admin_name: 'Wildlife Conservation Team',
            action: 'notification',
            notes: notification.admin_notes || notification.message,
            created_at: notification.created_at,
            previous_status: '',
            new_status: notification.status || sighting.status
          });
        }
      });
    }

    // Sort by creation date (newest first)
    allAdminItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (allAdminItems.length === 0) {
      return (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-700 mb-3">Admin Review History</h4>
          <p className="text-sm text-purple-600 text-center">No admin review history yet.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-medium text-purple-700 mb-3">
          Admin Review History ({allAdminItems.length})
        </h4>
        <div className="space-y-3">
          {allAdminItems.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded border border-purple-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-purple-800">{item.admin_name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.type === 'notification' ? 'bg-blue-100 text-blue-800' :
                    item.type === 'admin_history' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.action.replace('_', ' ')}
                    {item.type === 'notification' && ' (Notification)'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              
              {item.previous_status && item.new_status && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-600">Status change:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    {item.previous_status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 rounded text-xs ${
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
                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded border">
                  {item.notes}
                </p>
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
        (sighting.specific_location && sighting.specific_location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const sightingDate = new Date(sighting.created_at);
      const dateMatch = (!dateRange.start || sightingDate >= new Date(dateRange.start)) &&
                       (!dateRange.end || sightingDate <= new Date(dateRange.end + 'T23:59:59'));

      return statusMatch && typeMatch && speciesMatch && conservationMatch && searchMatch && dateMatch;
    });
  };

  // Helper functions
  const getStatusColor = (status: SightingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConservationColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'critically endangered': return 'bg-red-100 text-red-800 border-red-200';
      case 'endangered': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'vulnerable': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'near threatened': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'least concern': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDetectionTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800 border-green-200';
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'real-time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manual_report': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasMedia = (sighting: Sighting) => {
    return !!(sighting.image_path || sighting.video_path);
  };

  const getMediaPreview = (sighting: Sighting) => {
    const mediaPath = sighting.video_path || sighting.image_path;
    if (!mediaPath) return null;

    const mediaUrl = getMediaUrl(mediaPath);
    if (!mediaUrl) return null;

    if (isVideoFile(mediaPath) || sighting.video_path) {
      return (
        <div className="relative">
          <VideoPlayer 
            src={mediaUrl} 
            className="w-full h-32 object-cover rounded-md"
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      );
    } else {
      return (
        <ImageWithFallback 
          src={mediaUrl}
          alt={`Detection of ${sighting.species}`}
          className="w-full h-32 object-cover rounded-md"
        />
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading your reports...</p>
              {mounted && (
                <>
                  <p className="text-xs text-gray-400 mt-1">User ID: {userId}</p>
                  <p className="text-xs text-gray-400">Backend: {API_BASE_URL}</p>
                  <p className="text-xs text-gray-400 mt-2">{debugInfo}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!userId && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">Please log in to view your reports history.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Reports History</h1>
                <p className="text-gray-600 mt-2">
                  View all your wildlife sightings and reports from the database.
                </p>
                <p className="text-sm text-gray-400">
                  User ID: {userId} | Total Reports: {sightings.length} | Filtered: {filteredSightings.length}
                </p>
                <p className="text-sm text-green-600">{debugInfo}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={exportLoading || filteredSightings.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {exportLoading ? (
                    <>
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats.totalSightings > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xl font-bold text-blue-600">{stats.totalSightings}</div>
                <div className="text-gray-600 text-sm">Total Reports</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-gray-600 text-sm">Resolved</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-gray-600 text-sm">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xl font-bold text-purple-600">{stats.imageDetections}</div>
                <div className="text-gray-600 text-sm">Image</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xl font-bold text-indigo-600">{stats.manualReports}</div>
                <div className="text-gray-600 text-sm">Manual</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xl font-bold text-teal-600">{stats.uniqueSpecies}</div>
                <div className="text-gray-600 text-sm">Species</div>
              </div>
            </div>
          )}

          {/* Filters */}
          {sightings.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold mb-4">Filter & Search Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Species, description, habitat, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                  <select
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Species</option>
                    {uniqueSpecies.map(species => (
                      <option key={species} value={species}>{species}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detection Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as DetectionType)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conservation Status</label>
                  <select
                    value={filterConservation}
                    onChange={(e) => setFilterConservation(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    {uniqueConservation.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as SightingStatus | 'all')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reports List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Your Reports ({filteredSightings.length})
              </h3>
              {sightings.length > 0 && (
                <span className="text-sm text-gray-500">
                  Showing {filteredSightings.length} of {sightings.length} reports
                </span>
              )}
            </div>

            {filteredSightings.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg mb-2">No reports found</p>
                <p className="text-gray-400 text-sm">
                  {sightings.length === 0 
                    ? "You haven't submitted any wildlife reports yet."
                    : "No reports match your current filters."
                  }
                </p>
                {sightings.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/animal-detection'}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Submit Your First Report
                  </button>
                )}
              </div>
            ) : (
              filteredSightings.map((sighting) => (
                <div
                  key={sighting.id}
                  className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedSighting?.id === sighting.id 
                      ? 'border-blue-500 ring-2 ring-blue-100 transform scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSighting(sighting)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      {/* Media Preview */}
                      {hasMedia(sighting) && (
                        <div className="mb-3">
                          {getMediaPreview(sighting)}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{sighting.species}</h3>
                            {sighting.conservation_status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConservationColor(sighting.conservation_status)}`}>
                                {sighting.conservation_status}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDetectionTypeColor(sighting.detection_type)}`}>
                              {sighting.detection_type === 'manual_report' ? 'Manual Report' : sighting.detection_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Condition: {sighting.condition} • 
                            Confidence: {(sighting.confidence * 100).toFixed(1)}%
                          </p>
                          {sighting.description && (
                            <p className="text-sm text-gray-700 mt-1">{sighting.description}</p>
                          )}
                          {sighting.specific_location && (
                            <p className="text-sm text-blue-600 mt-1">
                              📍 {sighting.specific_location}
                            </p>
                          )}
                          {sighting.number_of_animals !== undefined && (
                            <p className="text-sm text-green-600 mt-1">
                              🐾 {sighting.number_of_animals} animal{sighting.number_of_animals !== 1 ? 's' : ''}
                            </p>
                          )}
                          {sighting.urgency_level && sighting.urgency_level !== 'medium' && (
                            <p className="text-sm text-red-600 mt-1">
                              ⚠️ {sighting.urgency_level} urgency
                            </p>
                          )}
                          {/* ✅ FIXED: Show admin notes preview from both sources */}
                          {(sighting.admin_notes || (sighting.notifications && sighting.notifications.some(n => n.admin_notes))) && (
                            <p className="text-sm text-purple-600 mt-1">
                              💬 Admin: {sighting.admin_notes || 
                                (sighting.notifications?.find(n => n.admin_notes)?.admin_notes?.substring(0, 50) + '...')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(sighting.status)}`}>
                            {sighting.status.replace('_', ' ')}
                          </span>
                          {/* ✅ ADDED: Admin review badge - now includes notifications */}
                          {(sighting.admin_notes || (sighting.admin_history && sighting.admin_history.length > 0) || (sighting.notifications && sighting.notifications.some(n => n.admin_notes))) && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                              Admin Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Type: {sighting.detection_type}</span>
                          {sighting.location_lat && sighting.location_lng && (
                            <span>Location: {sighting.location_lat.toFixed(4)}, {sighting.location_lng.toFixed(4)}</span>
                          )}
                          {hasMedia(sighting) && (
                            <span className="flex items-center gap-1 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {isVideoFile(sighting.image_path) || sighting.video_path ? 'Video' : 'Image'} Available
                            </span>
                          )}
                        </div>
                        <span>{new Date(sighting.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Report Detail View */}
          {selectedSighting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Report Details</h2>
                  <button
                    onClick={() => setSelectedSighting(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Media */}
                  {hasMedia(selectedSighting) && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {isVideoFile(selectedSighting.image_path) || selectedSighting.video_path ? 'Detection Video' : 'Detection Image'}
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {isVideoFile(selectedSighting.image_path) || selectedSighting.video_path ? (
                          <VideoPlayer 
                            src={getMediaUrl(selectedSighting.video_path || selectedSighting.image_path)!}
                            className="w-full h-64 object-cover rounded-md"
                          />
                        ) : (
                          <ImageWithFallback 
                            src={getMediaUrl(selectedSighting.image_path)!}
                            alt={`Detection of ${selectedSighting.species}`}
                            className="w-full h-64 object-cover rounded-md"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* ✅ ADDED: Evidence Media Section (same as notifications) */}
                  {renderEvidenceMedia(selectedSighting)}

                  {/* Animal Information */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Animal Information</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-gray-900 text-lg">{selectedSighting.species}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <span className="ml-1 font-medium capitalize">{selectedSighting.condition}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <span className="ml-1 font-medium">{(selectedSighting.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Detection Type:</span>
                          <span className="ml-1 font-medium capitalize">
                            {selectedSighting.detection_type === 'manual_report' ? 'Manual Report' : selectedSighting.detection_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-1 font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(selectedSighting.status)}`}>
                            {selectedSighting.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Location */}
                      {selectedSighting.location_lat && selectedSighting.location_lng && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm">
                            <span className="text-gray-600">GPS Location:</span>
                            <span className="ml-1 font-medium">
                              {selectedSighting.location_lat.toFixed(6)}, {selectedSighting.location_lng.toFixed(6)}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Report Details for Manual Reports */}
                      {selectedSighting.is_manual_report && selectedSighting.title && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{selectedSighting.title}</p>
                          {selectedSighting.description && (
                            <p className="text-sm text-gray-700 mt-1">{selectedSighting.description}</p>
                          )}
                        </div>
                      )}

                      {/* Conservation Info */}
                      {(selectedSighting.conservation_status || selectedSighting.habitat || selectedSighting.population || selectedSighting.recommended_care) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {selectedSighting.conservation_status && (
                            <p className="text-sm">
                              <span className="text-gray-600">Conservation:</span>
                              <span className={`ml-1 font-medium px-2 py-1 rounded-full text-xs ${getConservationColor(selectedSighting.conservation_status)}`}>
                                {selectedSighting.conservation_status}
                              </span>
                            </p>
                          )}
                          {selectedSighting.habitat && (
                            <p className="text-sm">
                              <span className="text-gray-600">Habitat:</span>
                              <span className="ml-1 font-medium">{selectedSighting.habitat}</span>
                            </p>
                          )}
                          {selectedSighting.population && (
                            <p className="text-sm">
                              <span className="text-gray-600">Population:</span>
                              <span className="ml-1 font-medium">{selectedSighting.population}</span>
                            </p>
                          )}
                          {selectedSighting.recommended_care && (
                            <p className="text-sm mt-2">
                              <span className="text-gray-600">Recommended Care:</span>
                              <span className="ml-1 font-medium text-blue-600">{selectedSighting.recommended_care}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✅ FIXED: Detailed Sighting Information Section */}
                  {renderDetailedSightingInfo(selectedSighting)}

                  {/* ✅ FIXED: Admin History Section - NOW INCLUDES NOTIFICATIONS */}
                  {renderAdminHistory(selectedSighting)}

                  {/* Detection Info */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Detection Info</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p>Detection Type: <span className="capitalize">
                        {selectedSighting.detection_type === 'manual_report' ? 'Manual Report' : selectedSighting.detection_type}
                      </span></p>
                      <p>Reported: {new Date(selectedSighting.created_at).toLocaleString()}</p>
                      {selectedSighting.updated_at !== selectedSighting.created_at && (
                        <p>Updated: {new Date(selectedSighting.updated_at).toLocaleString()}</p>
                      )}
                      {selectedSighting.is_manual_report ? (
                        <p className="text-purple-600 font-medium">Manual User Report</p>
                      ) : (
                        <p className="text-blue-600 font-medium">Automated System Detection</p>
                      )}
                    </div>
                  </div>

                  {/* Non-deletable Notice */}
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 text-center">
                      ℹ️ This report cannot be deleted. Please contact the administrator if you believe there is an error.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}