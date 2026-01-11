'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  EyeOff,
  Filter,
  ExternalLink,
  Image as ImageIcon,
  Video,
  MapPin,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  MessageSquare,
  Shield,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';

// ✅ FIXED: Use the same API URL as animaldetection.tsx
const API_URL = "http://10.82.64.38:3001";
//const API_URL = "http://192.168.100.77:3001";

interface UserNotification {
  id: number;
  report_id: number;
  message: string;
  status: string;
  created_at: string;
  species?: string;
  admin_notes?: string;
  is_read: boolean;
  confidence?: number;
  condition?: string;
  condition_confidence?: number;
  detection_type?: string;
  conservation_status?: string;
  habitat?: string;
  population?: string;
  // ✅ ADDED MEDIA FIELDS:
  image_path?: string | null;
  evidence_images?: string[];
  recommended_care?: string;
  // ✅ ADDED: Character traits field
  character_traits?: string;
  // ✅ ADD DETAILED SIGHTING FIELDS:
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
  // ✅ ADD DIRECT FIELDS FOR BACKWARD COMPATIBILITY:
  sighting_date?: string;
  specific_location?: string;
  number_of_animals?: number;
  behavior_observed?: string;
  observer_notes?: string;
  urgency_level?: string;
}

interface MediaViewerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt: string;
  onClose: () => void;
}

// ✅ ADDED: Full-screen media viewer component
const MediaViewer: React.FC<MediaViewerProps> = ({ mediaUrl, mediaType, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '0' || e.key === 'r') resetView();
      if (e.key === '+' || e.key === '=') setScale(prev => Math.min(5, prev + 0.1));
      if (e.key === '-' || e.key === '_') setScale(prev => Math.max(0.1, prev - 0.1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-2 bg-black/70 text-white px-4 py-2 rounded-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScale(prev => Math.max(0.1, prev - 0.1));
            }}
            className="p-2 hover:bg-white/20 rounded"
            title="Zoom Out (or press -)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScale(prev => Math.min(5, prev + 0.1));
            }}
            className="p-2 hover:bg-white/20 rounded"
            title="Zoom In (or press +)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            className="p-2 hover:bg-white/20 rounded text-sm"
            title="Reset View (press R)"
          >
            Reset
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
          title="Close (ESC)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Media Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {mediaType === 'video' ? (
          <div className="max-w-[90vw] max-h-[90vh]">
            <video 
              src={mediaUrl}
              className="max-w-full max-h-full"
              controls
              autoPlay
            />
          </div>
        ) : (
          <div 
            className="transition-transform duration-200"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              cursor: scale > 1 ? 'grab' : 'default',
              transformOrigin: 'center center'
            }}
          >
            <img 
              src={mediaUrl}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 text-white/70 text-sm">
        {mediaType === 'image' && (
          <>
            <span className="hidden md:inline">Scroll to zoom • Click and drag to pan • </span>
            <span>ESC to close • R to reset</span>
          </>
        )}
      </div>
    </div>
  );
};

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<string>('all'); // 'all', 'unread', 'resolved', 'pending'
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null); // ✅ ADDED: Media viewer state

  // ✅ FIXED: Use the same API URL as animaldetection.tsx
  const API_BASE_URL = API_URL;

  // ✅ ADDED HELPER FUNCTIONS
  const getMediaUrl = (filename: string | null) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${API_BASE_URL}/api/uploaded-images/${filename}`;
  };

  const isVideoFile = (filename: string | null) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // ✅ ADDED: Function to handle media click
  const handleMediaClick = (mediaUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const type = isVideoFile(mediaUrl) ? 'video' : 'image';
    setSelectedMedia({ url: mediaUrl, type });
  };

  // ✅ ADDED: Function to check if notification is from admin
  const isAdminNotification = (notification: UserNotification) => {
    return notification.admin_notes || 
           notification.message?.includes('admin') ||
           notification.message?.includes('resolved') ||
           notification.message?.includes('update') ||
           notification.status === 'resolved';
  };

  // ✅ ADDED: Function to render character traits
  const renderCharacterTraits = (notification: UserNotification) => {
    if (!notification.character_traits) return null;

    const traits = notification.character_traits.split(',').map((trait: string) => trait.trim()).filter(trait => trait);
    
    if (traits.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {traits.map((trait: string, index: number) => (
          <span 
            key={index}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100 shadow-sm"
          >
            {trait}
          </span>
        ))}
      </div>
    );
  };

  // ✅ FIXED: Function to render detailed sighting information
  const renderDetailedSightingInfo = (notification: UserNotification) => {
    const detailedData = notification.detailed_sighting_data || {};
    
    const sightingDate = detailedData.sighting_date || notification.sighting_date;
    const specificLocation = detailedData.specific_location || notification.specific_location;
    const numberOfAnimals = detailedData.number_of_animals || notification.number_of_animals;
    const behaviorObserved = detailedData.behavior_observed || notification.behavior_observed;
    const observerNotes = detailedData.observer_notes || notification.observer_notes;
    const urgencyLevel = detailedData.urgency_level || notification.urgency_level;
    const reporterName = detailedData.reporter_name;

    const hasDetailedData = sightingDate || specificLocation || numberOfAnimals || 
                           behaviorObserved || observerNotes || urgencyLevel || reporterName;

    if (!hasDetailedData) return null;

    const getUrgencyIcon = (level: string) => {
      switch(level?.toLowerCase()) {
        case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
        case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        default: return <AlertCircle className="w-4 h-4 text-green-500" />;
      }
    };

    return (
      <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
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
          {numberOfAnimals && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-green-100">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Animals Count</p>
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
                <MessageSquare className="w-4 h-4 text-green-600" />
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

  // ✅ ADDED: Function to handle "View Full Report" click
  const handleViewFullReport = (notification: UserNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedReportId(expandedReportId === notification.report_id ? null : notification.report_id);
    
    console.log(`📋 Viewing full report for report ID: ${notification.report_id}`);
    console.log('📊 Report data:', notification);
    
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  // ✅ ADDED: Function to render full report details
  const renderFullReportDetails = (notification: UserNotification) => {
    if (expandedReportId !== notification.report_id) return null;

    return (
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Full Report Details
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedReportId(null);
            }}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Close Details
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Metadata */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h5 className="font-semibold text-blue-700 mb-2">Report Metadata</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report ID:</span>
                  <span className="font-bold">#{notification.report_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    notification.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    notification.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {notification.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Species Information */}
            {notification.species && (
              <div className="bg-white p-4 rounded-lg border border-green-100">
                <h5 className="font-semibold text-green-700 mb-2">Species Information</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Species:</span>
                    <span className="font-bold">{notification.species}</span>
                  </div>
                  {notification.conservation_status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conservation:</span>
                      <span className={`font-bold ${
                        notification.conservation_status === 'Endangered' ? 'text-red-600' :
                        notification.conservation_status === 'Vulnerable' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {notification.conservation_status}
                      </span>
                    </div>
                  )}
                  {notification.habitat && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Habitat:</span>
                      <span>{notification.habitat}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            {notification.confidence && (
              <div className="bg-white p-4 rounded-lg border border-purple-100">
                <h5 className="font-semibold text-purple-700 mb-2">Detection Analysis</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Confidence Score</span>
                      <span className="font-bold">{(notification.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          notification.confidence > 0.8 ? 'bg-green-500' :
                          notification.confidence > 0.6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${notification.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {notification.condition && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Animal Condition:</span>
                      <span className="font-bold">{notification.condition}</span>
                    </div>
                  )}
                  
                  {notification.detection_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Detection Type:</span>
                      <span className="font-bold">{notification.detection_type}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes (if any) */}
            {notification.admin_notes && (
              <div className="bg-white p-4 rounded-lg border border-orange-100">
                <h5 className="font-semibold text-orange-700 mb-2">Admin Notes</h5>
                <p className="text-gray-700 leading-relaxed">{notification.admin_notes}</p>
              </div>
            )}
          </div>

          {/* Evidence Gallery - Full Width */}
          {(() => {
            const mediaToShow = [];
            
            if (notification.image_path) {
              mediaToShow.push(notification.image_path);
            }
            
            if (notification.evidence_images) {
              notification.evidence_images.forEach(img => {
                if (!notification.image_path || img !== notification.image_path) {
                  mediaToShow.push(img);
                }
              });
            }
            
            return mediaToShow.length > 0 ? (
              <div className="md:col-span-2">
                <h5 className="font-semibold text-gray-700 mb-3">Evidence Gallery</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mediaToShow.map((media, index) => {
                    const mediaUrl = getMediaUrl(media);
                    if (!mediaUrl) return null;
                    
                    const isVideo = isVideoFile(media);
                    
                    return (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white cursor-pointer hover:border-blue-300 transition-colors"
                        onClick={(e) => handleMediaClick(mediaUrl, e)}
                      >
                        {isVideo ? (
                          <div className="relative">
                            <video 
                              src={mediaUrl}
                              className="w-full h-48 object-contain bg-black"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                                <Video className="w-8 h-8 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              Video
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img 
                              src={mediaUrl}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-48 object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                Click to view full size
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="p-3 text-center text-sm text-gray-600">
                          Evidence {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </div>
    );
  };

  useEffect(() => {
    console.log('🔍 Checking ALL localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      console.log(`📦 ${key}:`, value);
    }

    const possibleUserKeys = [
      'currentUser',
      'user',
      'userData', 
      'authUser',
      'userInfo',
      'pawthcare_user',
      'token',
      'userId'
    ];

    let userFound = false;
    
    for (const key of possibleUserKeys) {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        console.log(`✅ Found data in key: ${key}`, storedData);
        try {
          const userData = JSON.parse(storedData);
          console.log('👤 Parsed user data:', userData);
          
          const userId = userData.id || userData.user_id || userData.userId || userData._id || storedData;
          if (userId) {
            console.log(`🎯 Setting user ID: ${userId}`);
            setUserId(Number(userId));
            userFound = true;
            break;
          }
        } catch (error) {
          console.log(`🔢 ${key} contains non-JSON data:`, storedData);
          const userId = parseInt(storedData);
          if (!isNaN(userId)) {
            console.log(`🎯 Setting user ID from string: ${userId}`);
            setUserId(userId);
            userFound = true;
            break;
          }
        }
      }
    }

    if (!userFound) {
      console.log('❌ No valid user data found in localStorage');
      setError('Please log in to view notifications');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log('🔄 Fetching notifications for user:', userId);
      console.log('🌐 Using backend URL:', API_BASE_URL);
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setError(null);
      setLoading(true);
      
      console.log('📨 Fetching notifications for user ID:', userId);
      console.log('🌐 Backend URL:', `${API_BASE_URL}/api/user/${userId}/notifications`);
      
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/notifications`);
      
      console.log('📨 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Notifications data received:', data);
        
        if (data.notifications && Array.isArray(data.notifications)) {
          const formattedNotifications = data.notifications.map((notif: any) => {
            console.log('🔍 Processing notification:', notif.id);
            console.log('🔍 Full notification data:', notif);
            
            const reportData = notif.report_data || {};
            const detailedSightingData = reportData.detailed_sighting_data || {};
            
            return {
              id: notif.id,
              report_id: notif.report_id,
              message: notif.message || notif.admin_notes || 'Update on your report',
              status: notif.status || 'under_review',
              created_at: notif.created_at,
              species: notif.species || reportData.species,
              admin_notes: notif.admin_notes,
              is_read: notif.is_read || false,
              confidence: notif.confidence || reportData.confidence,
              condition: notif.condition || reportData.condition,
              condition_confidence: notif.condition_confidence || reportData.condition_confidence,
              detection_type: notif.detection_type || reportData.detection_type,
              conservation_status: notif.conservation_status || reportData.conservation_status,
              habitat: notif.habitat || reportData.habitat,
              population: notif.population || reportData.population,
              image_path: notif.image_path || reportData.image_path,
              evidence_images: notif.evidence_images || reportData.evidence_images || [],
              recommended_care: notif.recommended_care || reportData.recommended_care,
              character_traits: notif.character_traits || reportData.character_traits || detailedSightingData.character_traits,
              detailed_sighting_data: detailedSightingData,
              sighting_date: notif.sighting_date || reportData.sighting_date || detailedSightingData.sighting_date,
              specific_location: notif.specific_location || reportData.specific_location || detailedSightingData.specific_location,
              number_of_animals: notif.number_of_animals || reportData.number_of_animals || detailedSightingData.number_of_animals,
              behavior_observed: notif.behavior_observed || reportData.behavior_observed || detailedSightingData.behavior_observed,
              observer_notes: notif.observer_notes || reportData.observer_notes || detailedSightingData.observer_notes,
              urgency_level: notif.urgency_level || reportData.urgency_level || detailedSightingData.urgency_level
            };
          });
          
          console.log('✅ Formatted notifications with detailed data:', formattedNotifications);
          
          setNotifications(formattedNotifications);
          setUnreadCount(formattedNotifications.filter((n: UserNotification) => !n.is_read).length);
        } else {
          console.log('📝 No notifications array in response');
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        console.log('❌ Failed to fetch notifications');
        setError(`Failed to load notifications from server at ${API_BASE_URL}`);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Network error fetching notifications:', error);
      setError(`Network error: Could not connect to server at ${API_BASE_URL}`);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!userId) return;
    
    try {
      console.log('📝 Marking notification as read:', notificationId);
      console.log('🌐 Backend URL:', `${API_BASE_URL}/api/user/notifications/${notificationId}/read`);
      
      const response = await fetch(`${API_BASE_URL}/api/user/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        console.log('✅ Marked notification as read');
      } else {
        console.log('⚠️ Could not mark as read on server, updating locally');
      }
      
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    
    try {
      setMarkingAll(true);
      console.log('📝 Marking all notifications as read');
      console.log('🌐 Backend URL:', `${API_BASE_URL}/api/user/notifications/read-all`);
      
      const response = await fetch(`${API_BASE_URL}/api/user/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        console.log('✅ Marked all notifications as read');
      } else {
        console.log('⚠️ Could not mark all as read on server, updating locally');
      }
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })));
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700'
        };
      case 'dismissed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className="w-4 h-4" />,
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          textColor: 'text-gray-700'
        };
      case 'under_review':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Eye className="w-4 h-4" />,
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-blue-700'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-4 h-4" />,
          bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          textColor: 'text-yellow-700'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          textColor: 'text-gray-700'
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Invalid date';
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'resolved') return notification.status === 'resolved';
    if (filter === 'pending') return notification.status === 'pending' || notification.status === 'under_review';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your notifications...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h3>
          <p className="text-gray-600 mb-6">Please log in to view your notifications</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen Media Viewer */}
      {selectedMedia && (
        <MediaViewer
          mediaUrl={selectedMedia.url}
          mediaType={selectedMedia.type}
          alt="Evidence"
          onClose={() => setSelectedMedia(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                  <p className="text-blue-100 mt-1">Updates about your wildlife reports</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchNotifications}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium flex items-center gap-2 border border-white/30"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>      
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={markingAll}
                    className={`px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium flex items-center gap-2 ${
                      markingAll ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {markingAll ? 'Marking...' : `Mark All as Read`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{notifications.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Unread</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{unreadCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {notifications.filter(n => n.status === 'resolved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {notifications.filter(n => n.status === 'pending' || n.status === 'under_review').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Filter Notifications</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'resolved', label: 'Resolved', count: notifications.filter(n => n.status === 'resolved').length },
                { key: 'pending', label: 'Pending', count: notifications.filter(n => n.status === 'pending' || n.status === 'under_review').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filter === key 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {label} <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">Connection Error</h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-4 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No notifications found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {filter === 'all' 
                  ? "You don't have any notifications yet. Submit a wildlife report to receive updates."
                  : `No ${filter} notifications found.`}
              </p>
              <button
                onClick={() => window.location.href = '/report'}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Submit a Wildlife Report
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNotifications.map((notification) => {
                const statusConfig = getStatusConfig(notification.status);
                
                return (
                  <div 
                    key={notification.id} 
                    className={`bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      notification.is_read 
                        ? 'border-gray-200' 
                        : 'border-blue-300 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-l-4 border-l-blue-500'
                    }`}
                  >
                    {/* Notification Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <div className="text-white">
                              {statusConfig.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-xl text-gray-900 truncate">
                                {notification.species || 'Wildlife Report Update'}
                              </h3>
                              {!notification.is_read && (
                                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusConfig.color} flex items-center gap-1.5`}>
                                {statusConfig.icon}
                                {notification.status.replace('_', ' ')}
                              </span>
                              {notification.detection_type && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-lg text-sm font-semibold border border-purple-100">
                                  {notification.detection_type}
                                </span>
                              )}
                              {isAdminNotification(notification) && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-lg text-sm font-semibold border border-orange-100">
                                  Admin Update
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                            {formatDate(notification.created_at)}
                          </span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="p-6">
                      <div className={`p-5 rounded-xl border mb-6 ${
                        isAdminNotification(notification) 
                          ? 'bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-orange-200' 
                          : 'bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-blue-200'
                      }`}>
                        {isAdminNotification(notification) && (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-orange-800">Wildlife Conservation Team</h4>
                              <p className="text-sm text-orange-600">Official Update</p>
                            </div>
                          </div>
                        )}
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {notification.message}
                        </p>
                        {notification.admin_notes && notification.admin_notes !== notification.message && (
                          <div className="mt-4 pt-4 border-t border-orange-200/50">
                            <p className="text-sm text-gray-700 font-medium">
                              <span className="text-orange-600">Additional notes:</span> {notification.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Media Gallery */}
                      {(() => {
                        const mediaToShow = [];
                        
                        if (notification.image_path) {
                          mediaToShow.push(notification.image_path);
                        }
                        
                        if (notification.evidence_images) {
                          notification.evidence_images.forEach(img => {
                            if (!notification.image_path || img !== notification.image_path) {
                              mediaToShow.push(img);
                            }
                          });
                        }
                        
                        return mediaToShow.length > 0 ? (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <ImageIcon className="w-5 h-5 text-gray-600" />
                              <h4 className="font-semibold text-gray-900">Report Evidence</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {mediaToShow.map((media, index) => {
                                const mediaUrl = getMediaUrl(media);
                                if (!mediaUrl) return null;
                                
                                const isVideo = isVideoFile(media);
                                
                                return (
                                  <div 
                                    key={index} 
                                    className="group relative cursor-pointer"
                                    onClick={(e) => handleMediaClick(mediaUrl, e)}
                                  >
                                    {isVideo ? (
                                      <div className="relative rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-all duration-300">
                                        <video 
                                          src={mediaUrl}
                                          className="w-full h-40 object-contain bg-black"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Video className="w-6 h-6 text-white" />
                                          </div>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                          <Video className="w-3 h-3" />
                                          Video
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="relative rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-all duration-300">
                                        <img 
                                          src={mediaUrl}
                                          alt={`Evidence ${index + 1}`}
                                          className="w-full h-40 object-contain bg-gray-50"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                          <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                            Click to view full size
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      Evidence {index + 1}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Click on any image/video to view in full screen with zoom controls
                            </p>
                          </div>
                        ) : null;
                      })()}
                      
                      {/* Detection Details */}
                      {(notification.confidence || notification.condition || notification.conservation_status || notification.recommended_care || notification.character_traits) && (
                        <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-gray-600" />
                            <h4 className="font-semibold text-gray-900">Detection Analysis</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {notification.confidence && (
                              <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Confidence Score</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-gray-900">
                                    {(notification.confidence * 100).toFixed(1)}%
                                  </span>
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                      style={{ width: `${notification.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {notification.condition && (
                              <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Animal Condition</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-gray-900">{notification.condition}</span>
                                  {notification.condition_confidence && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                      {notification.condition_confidence}% certain
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {notification.conservation_status && (
                              <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Conservation Status</p>
                                <span className={`text-lg font-bold ${
                                  notification.conservation_status === 'Endangered' ? 'text-red-600' :
                                  notification.conservation_status === 'Vulnerable' ? 'text-orange-600' :
                                  notification.conservation_status === 'Near Threatened' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {notification.conservation_status}
                                </span>
                              </div>
                            )}
                            
                            {notification.habitat && (
                              <div className="bg-white p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Habitat</p>
                                <span className="text-lg font-semibold text-gray-900">{notification.habitat}</span>
                              </div>
                            )}
                            
                            {notification.character_traits && (
                              <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-2">Character Traits</p>
                                {renderCharacterTraits(notification)}
                              </div>
                            )}
                            
                            {notification.recommended_care && (
                              <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-5 h-5 text-blue-600" />
                                  <p className="font-semibold text-blue-800">Health Recommendation</p>
                                </div>
                                <p className="text-blue-900">{notification.recommended_care}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Detailed Sighting Information */}
                      {renderDetailedSightingInfo(notification)}
                      
                      {/* Full Report Details (expanded view) */}
                      {renderFullReportDetails(notification)}
                      
                      {/* Footer Actions */}
                      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-medium">
                            Report ID: <span className="text-gray-900 font-bold">#{notification.report_id}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Wildlife Conservation System</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleViewFullReport(notification, e)}
                            className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                          >
                            {expandedReportId === notification.report_id ? 'Hide Full Report' : 'View Full Report'}
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                              <Check className="w-4 h-4" />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-40"
            title="Mark all as read"
          >
            <Check className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </>
  );
}