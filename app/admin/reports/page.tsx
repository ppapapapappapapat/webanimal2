'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// ✅ FIXED: Multiple API URL options with fallback
const API_URLS = [
  "http://10.82.64.38:3001",      // Your CURRENT IP with mobile data
  "http://192.168.100.77:3001",   // Your OLD wifi IP (keep as fallback)
  "http://localhost:3001",        // Local development
];

// Function to test API connectivity
const testAPIEndpoint = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log(`❌ API ${url} is not reachable`);
    return false;
  }
};

// Function to find working API URL
const findWorkingAPI = async (): Promise<string | null> => {
  console.log('🔍 Searching for working API...');
  console.log('📡 Available APIs:', API_URLS);
  
  for (const url of API_URLS) {
    console.log(`🔍 Testing API: ${url}`);
    const isWorking = await testAPIEndpoint(url);
    if (isWorking) {
      console.log(`✅ Found working API: ${url}`);
      return url;
    }
  }
  console.log('❌ No working API found');
  return null;
};

interface UserReport {
  id: number;
  user_id: number;
  username: string;
  email: string;
  sighting_id: number | null;
  species: string;
  confidence: number;
  condition: string;
  condition_confidence: number;
  title: string;
  description: string;
  report_type: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  location: { lat: number; lng: number } | null;
  evidence_images: string[];
  image_path: string | null;
  video_path: string | null;
  detection_type: 'image' | 'video' | 'real-time' | 'manual_report';
  created_at: string;
  updated_at: string;
  is_manual_report?: boolean;
  detection_created_at?: string;
  conservation_status?: string;
  habitat?: string;
  lifespan?: string;
  population?: string;
  recommended_care?: string;
  admin_notes?: string;
  notification_sent?: boolean;
  detailed_sighting_data?: {
    sighting_date?: string;
    specific_location?: string;
    number_of_animals?: number;
    behavior_observed?: string;
    observer_notes?: string;
    user_contact?: string;
    urgency_level?: string;
    reporter_name?: string;
    character_traits?: string;
  };
  sighting_date?: string;
  specific_location?: string;
  number_of_animals?: number;
  behavior_observed?: string;
  observer_notes?: string;
  user_contact?: string;
  urgency_level?: string;
  character_traits?: string;
}

type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

interface NotificationModalProps {
  report: UserReport;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string, updateStatus?: ReportStatus, adminNotes?: string) => void;
}

function NotificationModal({ report, isOpen, onClose, onSend }: NotificationModalProps) {
  const [message, setMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState<ReportStatus | 'no_change'>('no_change');
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      fetchNotificationHistory();
    }
  }, [isOpen, report]);

  const fetchNotificationHistory = async () => {
    try {
      setLoadingHistory(true);
      const workingAPI = await findWorkingAPI();
      if (!workingAPI) return;
      
      const response = await fetch(`${workingAPI}/api/admin/notifications?report_id=${report.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotificationHistory(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), updateStatus === 'no_change' ? undefined : updateStatus);
      setMessage('');
      setUpdateStatus('no_change');
      setTimeout(fetchNotificationHistory, 500);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Send Update to User</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message to {report.username} (will be sent via email and app notification)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Let the user know about the status of their report..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status (Optional)
          </label>
          <select
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value as ReportStatus | 'no_change')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="no_change">No Status Change</option>
            <option value="under_review">Mark as Under Review</option>
            <option value="resolved">Mark as Resolved</option>
            <option value="dismissed">Mark as Dismissed</option>
            <option value="pending">Reopen Report</option>
          </select>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Notification History</h4>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
            {loadingHistory ? (
              <p className="text-sm text-gray-500 text-center">Loading history...</p>
            ) : notificationHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No previous notifications</p>
            ) : (
              notificationHistory.map((notification) => (
                <div key={notification.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatDate(notification.created_at)}</span>
                    <span className={`px-1 rounded ${
                      notification.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      notification.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                      notification.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.status || 'sent'}
                    </span>
                  </div>
                  {notification.email_sent !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">
                      Email: {notification.email_sent ? '✅ Sent' : '❌ Failed'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send Update
          </button>
        </div>
      </div>
    </div>
  );
}

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
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

const VideoWithFallback = ({ 
  src, 
  className,
  alt,
  onErrorDebug
}: { 
  src: string; 
  className: string;
  alt: string;
  onErrorDebug?: (error: string) => void;
}) => {
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('❌ Video load error for URL:', src);
    setVideoError(true);
    setLoading(false);
    const videoElement = e.target as HTMLVideoElement;
    videoElement.style.display = 'none';
    
    if (onErrorDebug) {
      onErrorDebug(`Failed to load video: ${src}`);
    }
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully:', src);
    setLoading(false);
    setVideoError(false);
  };

  const handleVideoLoadStart = () => {
    console.log('🔄 Video loading started:', src);
    setLoading(true);
  };

  useEffect(() => {
    const testVideoAccess = async () => {
      try {
        console.log('🔍 Testing video access:', src);
        const response = await fetch(src, { method: 'HEAD' });
        if (!response.ok) {
          console.error('❌ Video not accessible via HEAD request:', src);
          setVideoError(true);
        } else {
          console.log('✅ Video accessible via HEAD request:', src);
        }
      } catch (error) {
        console.error('❌ Video access test failed:', error);
        setVideoError(true);
      }
    };

    if (src) {
      testVideoAccess();
    }
  }, [src]);

  if (videoError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-md`}>
        <div className="text-center text-gray-500 p-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">Video not available</p>
          <p className="text-xs mt-1 text-gray-600">Format: {src.split('.').pop()?.toUpperCase()}</p>
          <p className="text-xs mt-2 text-gray-500 break-all">URL: {src.split('/').pop()}</p>
          <button 
            onClick={() => window.open(src, '_blank')}
            className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Open video in new tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-md z-10">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
            <p className="text-xs text-gray-600 mt-2">Loading video...</p>
          </div>
        </div>
      )}
      <video 
        src={src}
        controls
        className={className}
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        onLoadStart={handleVideoLoadStart}
        title={alt}
        preload="metadata"
      >
        Your browser does not support the video tag.
        <track kind="captions" />
      </video>
    </div>
  );
};

// ✅ NEW: Slide-over panel component
function SlideOverPanel({ 
  report, 
  isOpen, 
  onClose, 
  onUpdateStatus,
  onSendNotification 
}: { 
  report: UserReport | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (reportId: number, newStatus: ReportStatus, adminNotes?: string) => void;
  onSendNotification: (report: UserReport) => void;
}) {
  const [mediaErrors, setMediaErrors] = useState<{[key: string]: string}>({});
  const [currentAPI, setCurrentAPI] = useState<string>('');

  // ✅ FIXED: Get current API URL when component mounts
  useEffect(() => {
    const getCurrentAPI = async () => {
      const api = await findWorkingAPI();
      if (api) {
        setCurrentAPI(api);
      }
    };
    getCurrentAPI();
  }, []);

  if (!isOpen || !report) return null;

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ✅ FIXED: Use dynamic API URL instead of hardcoded one
  const getMediaUrl = (filename: string | null) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    
    // Use currentAPI if available, otherwise fallback to the first API URL
    const baseUrl = currentAPI || API_URLS[0];
    return `${baseUrl}/api/uploaded-images/${filename}`;
  };

  const isVideoFile = (filename: string | null) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const renderCharacterTraits = (report: UserReport) => {
    if (!report.character_traits) return null;
    const traits = report.character_traits.split(',').map((trait: string) => trait.trim()).filter(trait => trait);
    if (traits.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <h4 className="text-sm font-medium text-indigo-700 mb-2">Character Traits</h4>
        <div className="flex flex-wrap gap-2">
          {traits.map((trait: string, index: number) => (
            <span 
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium border border-indigo-200"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Slide-over Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Urgency & Status Badges */}
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(report.urgency)}`}>
                {report.urgency.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ')}
              </span>
            </div>

            {/* Media Display */}
            {(report.image_path || report.video_path) && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {isVideoFile(report.image_path) || isVideoFile(report.video_path) 
                    ? 'Detection Video' 
                    : 'Detection Image'
                  }
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {isVideoFile(report.image_path) || isVideoFile(report.video_path) ? (
                    <VideoWithFallback 
                      src={getMediaUrl(report.image_path || report.video_path)!}
                      className="w-full h-48 object-cover rounded-md"
                      alt={`Detection video of ${report.species}`}
                    />
                  ) : (
                    <ImageWithFallback 
                      src={getMediaUrl(report.image_path)!}
                      alt={`Detection of ${report.species}`}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Animal Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Animal Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{report.species}</p>
                  <p className="text-sm text-gray-600">Condition: {report.condition}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-1 font-medium">{(report.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-1 font-medium capitalize">{report.detection_type}</span>
                  </div>
                </div>

                {renderCharacterTraits(report)}

                {(report.conservation_status || report.habitat) && (
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    {report.conservation_status && (
                      <p className="text-sm">
                        <span className="text-gray-600">Conservation:</span>
                        <span className="ml-1 font-medium">{report.conservation_status}</span>
                      </p>
                    )}
                    {report.habitat && (
                      <p className="text-sm">
                        <span className="text-gray-600">Habitat:</span>
                        <span className="ml-1 font-medium">{report.habitat}</span>
                      </p>
                    )}
                    {report.recommended_care && (
                      <p className="text-sm text-blue-600 font-medium">
                        Recommended: {report.recommended_care}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reporter Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Reporter</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{report.username}</p>
                <p className="text-sm text-gray-600">{report.email}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {report.description || `Sighting of ${report.species} detected with ${(report.confidence * 100).toFixed(1)}% confidence.`}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Timeline</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reported:</span>
                  <span className="font-medium">{new Date(report.created_at).toLocaleString()}</span>
                </div>
                {report.updated_at !== report.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium">{new Date(report.updated_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={() => onSendNotification(report)}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 01-2-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Send Update to User
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={report.status}
                onChange={(e) => onUpdateStatus(report.id, e.target.value as ReportStatus)}
                className="col-span-2 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UserReports() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [currentAPI, setCurrentAPI] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    critical: 0,
    realtime: 0
  });
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedReportForNotification, setSelectedReportForNotification] = useState<UserReport | null>(null);

  useEffect(() => {
    fetchUserReports();
  }, [filterStatus]);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      const workingAPI = await findWorkingAPI();
      if (!workingAPI) {
        setConnectionError(true);
        setLoading(false);
        return;
      }
      
      setCurrentAPI(workingAPI);
      
      const response = await fetch(`${workingAPI}/api/user-reports`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.reports && Array.isArray(data.reports)) {
          const transformedReports = data.reports.map((report: any) => {
            const detailedData = report.detailed_sighting_data || {};
            const imagePath = report.image_path || report.evidence_images?.[0];
            const videoPath = report.video_path || (isVideoFile(report.image_path) ? report.image_path : null);
            
            return {
              id: report.id,
              user_id: report.user_id,
              username: report.user_name,
              email: report.user_email,
              sighting_id: report.sighting_id,
              species: report.species || 'Unknown Species',
              confidence: report.confidence || 0,
              condition: report.condition || 'Unknown',
              condition_confidence: report.condition_confidence || 0,
              title: report.title || `Sighting of ${report.species || 'Unknown'}`,
              description: report.description || 'No description provided',
              report_type: report.report_type || 'sighting',
              urgency: report.urgency || 'medium',
              status: report.status || 'pending',
              location: report.location_lat && report.location_lng 
                ? { lat: report.location_lat, lng: report.location_lng } 
                : null,
              evidence_images: report.evidence_images || [],
              image_path: imagePath,
              video_path: videoPath,
              detection_type: report.detection_type || 'image',
              created_at: report.created_at,
              updated_at: report.updated_at,
              is_manual_report: report.is_manual_report || false,
              conservation_status: report.conservation_status,
              habitat: report.habitat,
              lifespan: report.lifespan,
              population: report.population,
              recommended_care: report.recommended_care,
              admin_notes: report.admin_notes,
              notification_sent: report.notification_sent,
              detailed_sighting_data: detailedData,
              character_traits: report.character_traits || null
            };
          });
          
          const realtimeCount = transformedReports.filter((r: UserReport) => r.detection_type === 'real-time').length;
          
          setReports(transformedReports);
          setStats({
            total: transformedReports.length,
            pending: transformedReports.filter((r: UserReport) => r.status === 'pending').length,
            critical: transformedReports.filter((r: UserReport) => r.urgency === 'critical').length,
            realtime: realtimeCount
          });
        }
      } else {
        await fetchSightingsFallback(workingAPI);
      }
    } catch (error) {
      console.error('Error fetching user reports:', error);
      setConnectionError(true);
      await fetchSightingsFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchSightingsFallback = async (workingAPI?: string) => {
    try {
      const api = workingAPI || await findWorkingAPI();
      if (!api) {
        setConnectionError(true);
        return;
      }
      
      const response = await fetch(`${api}/api/sightings`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.sightings && Array.isArray(data.sightings)) {
          const transformedSightings = data.sightings.map((sighting: any) => ({
            id: sighting.id,
            user_id: sighting.user_id,
            username: sighting.user?.username || `User ${sighting.user_id}`,
            email: sighting.user?.email || 'unknown@email.com',
            sighting_id: sighting.id,
            species: sighting.species,
            confidence: sighting.confidence,
            condition: sighting.condition || 'Unknown',
            condition_confidence: sighting.condition_confidence || 0,
            title: `Automated Detection: ${sighting.species}`,
            description: `Automated ${sighting.detection_type} detection of ${sighting.species} with ${(sighting.confidence * 100).toFixed(1)}% confidence`,
            report_type: 'sighting',
            urgency: 'medium',
            status: 'pending',
            location: sighting.location_lat && sighting.location_lng 
              ? { lat: sighting.location_lat, lng: sighting.location_lng } 
              : null,
            evidence_images: sighting.image_path ? [sighting.image_path] : [],
            image_path: sighting.image_path,
            video_path: isVideoFile(sighting.image_path) ? sighting.image_path : null,
            detection_type: sighting.detection_type,
            created_at: sighting.created_at,
            updated_at: sighting.created_at,
            is_manual_report: false,
            conservation_status: sighting.conservation_status,
            habitat: sighting.habitat,
            lifespan: sighting.lifespan,
            population: sighting.population,
            recommended_care: sighting.recommended_care,
            character_traits: sighting.character_traits || null
          }));
          
          const realtimeCount = transformedSightings.filter((r: UserReport) => r.detection_type === 'real-time').length;
          
          setReports(transformedSightings);
          setStats({
            total: transformedSightings.length,
            pending: transformedSightings.filter((r: UserReport) => r.status === 'pending').length,
            critical: transformedSightings.filter((r: UserReport) => r.urgency === 'critical').length,
            realtime: realtimeCount
          });
        }
      } else {
        setConnectionError(true);
      }
    } catch (error) {
      console.error('Fallback also failed:', error);
      setConnectionError(true);
      setReports([]);
      setStats({ total: 0, pending: 0, critical: 0, realtime: 0 });
    }
  };

  const isVideoFile = (filename: string | null) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const updateReportStatus = async (reportId: number, newStatus: ReportStatus) => {
  try {
    const workingAPI = await findWorkingAPI();
    if (!workingAPI) {
      console.error('No working API found');
      return;
    }

    console.log(`🔄 Updating report ${reportId} to status: ${newStatus}`);
    
    // ✅ FIXED: Add admin_name to match backend expectations
    const updateData = { 
      status: newStatus,
      admin_name: 'Admin'  // This is REQUIRED by your backend
    };

    console.log('🔍 Sending data:', updateData);
    console.log('🔍 URL:', `${workingAPI}/api/reports/${reportId}`);

    const response = await fetch(`${workingAPI}/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    console.log('🔍 Response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Status update successful:', result);
      
      // Update successful
      await fetchUserReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } else {
      // Try to read error message
      try {
        const errorData = await response.json();
        console.error('❌ Failed to update status:', errorData);
      } catch (e) {
        console.error('❌ Failed to update status, status code:', response.status);
      }
      
      // Fallback to local update
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    }
  } catch (error) {
    console.error('❌ Error updating report status:', error);
    // Fallback to local update
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  }
};
  const sendUserNotification = async (message: string, updateStatus?: ReportStatus) => {
  if (!selectedReportForNotification) return;

  try {
    const workingAPI = await findWorkingAPI();
    if (!workingAPI) {
      alert('Cannot connect to server. Please check your connection.');
      return;
    }

    const notificationData: any = {
      message,
      report_data: {
        species: selectedReportForNotification.species,
        confidence: selectedReportForNotification.confidence,
        condition: selectedReportForNotification.condition,
        conservation_status: selectedReportForNotification.conservation_status,
        habitat: selectedReportForNotification.habitat,
        population: selectedReportForNotification.population,
        recommended_care: selectedReportForNotification.recommended_care,
        character_traits: selectedReportForNotification.character_traits
      }
    };

    if (updateStatus) {
      notificationData.status = updateStatus;
    }

    console.log('📤 Sending notification with data:', notificationData);

    // Send notification
    const notifyResponse = await fetch(`${workingAPI}/api/reports/${selectedReportForNotification.id}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    const responseData = await notifyResponse.json();
    
    if (notifyResponse.ok) {
      console.log('✅ Notification response:', responseData);
      
      // Update the report status if it was changed (don't wait for it)
      if (updateStatus) {
        // Update locally immediately
        setReports(reports.map(report => 
          report.id === selectedReportForNotification.id 
            ? { ...report, status: updateStatus, updated_at: new Date().toISOString() } 
            : report
        ));
        
        if (selectedReport?.id === selectedReportForNotification.id) {
          const updatedReport = {
            ...selectedReport,
            status: updateStatus,
            updated_at: new Date().toISOString()
          };
          setSelectedReport(updatedReport);
        }
        
        // Then try to update on backend (but don't wait for it)
        updateReportStatus(selectedReportForNotification.id, updateStatus).catch(e => {
          console.log('⚠️ Background status update failed (but UI updated):', e);
        });
      }
      
      // Refresh reports list in background
      fetchUserReports().catch(e => console.log('⚠️ Background refresh failed:', e));
      
      setNotificationModalOpen(false);
      setSelectedReportForNotification(null);
      
      // Show success message with email status
      const emailStatus = responseData.email_sent ? 'Email and ' : '';
      alert(`${emailStatus}Notification sent successfully!`);
    } else {
      console.error('❌ Notification failed:', responseData);
      
      // Even if notification fails, update status locally if requested
      if (updateStatus) {
        setReports(reports.map(report => 
          report.id === selectedReportForNotification.id 
            ? { ...report, status: updateStatus } 
            : report
        ));
      }
      
      alert(`Notification sent but status update failed: ${responseData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    
    // Update status locally even on network error
    if (updateStatus) {
      setReports(reports.map(report => 
        report.id === selectedReportForNotification.id 
          ? { ...report, status: updateStatus } 
          : report
      ));
    }
    
    alert('Error processing request, but status was updated locally. Please check your connection.');
  }
};
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group reports by urgency for kanban columns
  const groupedReports = {
    critical: reports.filter(report => report.urgency === 'critical' && (filterStatus === 'all' || report.status === filterStatus)),
    high: reports.filter(report => report.urgency === 'high' && (filterStatus === 'all' || report.status === filterStatus)),
    medium: reports.filter(report => report.urgency === 'medium' && (filterStatus === 'all' || report.status === filterStatus)),
    low: reports.filter(report => report.urgency === 'low' && (filterStatus === 'all' || report.status === filterStatus))
  };

  const handleReportClick = (report: UserReport) => {
    setSelectedReport(report);
    setSlideOverOpen(true);
  };

  const handleSendNotificationClick = (report: UserReport) => {
    setSelectedReportForNotification(report);
    setNotificationModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (connectionError) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">🔌</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">
              Cannot connect to the backend server. Please check if your Flask server is running.
            </p>
            <button
              onClick={fetchUserReports}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wildlife Reports Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Prioritize and manage endangered species reports by urgency level
              </p>
            </div>
            {currentAPI && (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Connected to: {currentAPI.replace('http://', '')}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600">Total Reports</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-gray-600">Critical Priority</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.realtime}</div>
            <div className="text-gray-600">Real-Time</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Critical Column */}
          <div className="bg-red-50 border border-red-200 rounded-lg">
            <div className="p-4 border-b border-red-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-red-800 text-lg">
                  Critical
                  <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {groupedReports.critical.length}
                  </span>
                </h3>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-red-600 text-sm mt-1">Highest priority - immediate action needed</p>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {groupedReports.critical.map((report) => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onClick={handleReportClick}
                  onSendNotification={handleSendNotificationClick}
                />
              ))}
              {groupedReports.critical.length === 0 && (
                <div className="text-center py-8 text-red-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No critical reports</p>
                </div>
              )}
            </div>
          </div>

          {/* High Column */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg">
            <div className="p-4 border-b border-orange-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-orange-800 text-lg">
                  High
                  <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                    {groupedReports.high.length}
                  </span>
                </h3>
              </div>
              <p className="text-orange-600 text-sm mt-1">Important - review today</p>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {groupedReports.high.map((report) => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onClick={handleReportClick}
                  onSendNotification={handleSendNotificationClick}
                />
              ))}
              {groupedReports.high.length === 0 && (
                <div className="text-center py-8 text-orange-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No high priority reports</p>
                </div>
              )}
            </div>
          </div>

          {/* Medium Column */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="p-4 border-b border-yellow-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-yellow-800 text-lg">
                  Medium
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                    {groupedReports.medium.length}
                  </span>
                </h3>
              </div>
              <p className="text-yellow-600 text-sm mt-1">Moderate priority - review this week</p>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {groupedReports.medium.map((report) => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onClick={handleReportClick}
                  onSendNotification={handleSendNotificationClick}
                />
              ))}
              {groupedReports.medium.length === 0 && (
                <div className="text-center py-8 text-yellow-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No medium priority reports</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Column */}
          <div className="bg-green-50 border border-green-200 rounded-lg">
            <div className="p-4 border-b border-green-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-800 text-lg">
                  Low
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {groupedReports.low.length}
                  </span>
                </h3>
              </div>
              <p className="text-green-600 text-sm mt-1">Low priority - review when available</p>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {groupedReports.low.map((report) => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onClick={handleReportClick}
                  onSendNotification={handleSendNotificationClick}
                />
              ))}
              {groupedReports.low.length === 0 && (
                <div className="text-center py-8 text-green-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No low priority reports</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slide-over Panel */}
        <SlideOverPanel
          report={selectedReport}
          isOpen={slideOverOpen}
          onClose={() => setSlideOverOpen(false)}
          onUpdateStatus={updateReportStatus}
          onSendNotification={handleSendNotificationClick}
        />

        {/* Notification Modal */}
        {selectedReportForNotification && (
          <NotificationModal
            report={selectedReportForNotification}
            isOpen={notificationModalOpen}
            onClose={() => {
              setNotificationModalOpen(false);
              setSelectedReportForNotification(null);
            }}
            onSend={sendUserNotification}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Report Card Component for Kanban
function ReportCard({ 
  report, 
  onClick,
  onSendNotification
}: { 
  report: UserReport; 
  onClick: (report: UserReport) => void;
  onSendNotification: (report: UserReport) => void;
}) {
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-gray-300"
      onClick={() => onClick(report)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{report.species}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
          {report.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {report.condition && report.condition !== 'Unknown' 
          ? `Condition: ${report.condition}`
          : report.description?.substring(0, 80) + (report.description?.length > 80 ? '...' : '')
        }
      </p>

      {report.character_traits && (
        <p className="text-xs text-indigo-600 mb-2">
          🎭 {report.character_traits.split(',').slice(0, 2).join(', ')}
          {report.character_traits.split(',').length > 2 && '...'}
        </p>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>By: {report.username}</span>
          {(report.image_path || report.video_path) && (
            <span className="text-blue-500">📎</span>
          )}
        </div>
        <span>{new Date(report.created_at).toLocaleDateString()}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSendNotification(report);
        }}
        className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 01-2-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Notify User
      </button>
    </div>
  );
}