'use client';

import { useState, useEffect } from 'react';

// ✅ FIXED: Use the same API URL as animaldetection.tsx
const API_URL = "http://192.168.100.77:5000";

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
  };
  // ✅ ADD DIRECT FIELDS FOR BACKWARD COMPATIBILITY:
  sighting_date?: string;
  specific_location?: string;
  number_of_animals?: number;
  behavior_observed?: string;
  observer_notes?: string;
  urgency_level?: string;
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

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
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // ✅ ADDED: Function to check if notification is from admin
  const isAdminNotification = (notification: UserNotification) => {
    return notification.admin_notes || 
           notification.message?.includes('admin') ||
           notification.message?.includes('resolved') ||
           notification.message?.includes('update') ||
           notification.status === 'resolved';
  };

  // ✅ ADDED: Function to render detailed sighting information
  const renderDetailedSightingInfo = (notification: UserNotification) => {
    // Check both detailed_sighting_data and direct fields
    const detailedData = notification.detailed_sighting_data || {};
    
    // Use data from both sources
    const sightingDate = detailedData.sighting_date || notification.sighting_date;
    const specificLocation = detailedData.specific_location || notification.specific_location;
    const numberOfAnimals = detailedData.number_of_animals || notification.number_of_animals;
    const behaviorObserved = detailedData.behavior_observed || notification.behavior_observed;
    const observerNotes = detailedData.observer_notes || notification.observer_notes;
    const urgencyLevel = detailedData.urgency_level || notification.urgency_level;
    const reporterName = detailedData.reporter_name;

    // Check if we have any detailed data to show
    const hasDetailedData = sightingDate || specificLocation || numberOfAnimals || 
                           behaviorObserved || observerNotes || urgencyLevel || reporterName;

    if (!hasDetailedData) return null;

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
          {numberOfAnimals && (
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

  useEffect(() => {
    // Debug all localStorage to see what's actually stored
    console.log('🔍 Checking ALL localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      console.log(`📦 ${key}:`, value);
    }

    // Try different possible user storage keys
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
          
          // Extract user ID from different possible structures
          const userId = userData.id || userData.user_id || userData.userId || userData._id || storedData;
          if (userId) {
            console.log(`🎯 Setting user ID: ${userId}`);
            setUserId(Number(userId));
            userFound = true;
            break;
          }
        } catch (error) {
          // If it's not JSON, it might be just the user ID as a string
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
      
      // Fetch real notifications from backend
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/notifications`);
      
      console.log('📨 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Notifications data received:', data);
        
        if (data.notifications && Array.isArray(data.notifications)) {
          const formattedNotifications = data.notifications.map((notif: any) => {
            console.log('🔍 Processing notification:', notif.id);
            console.log('🔍 Full notification data:', notif);
            
            // ✅ FIXED: Extract data from report_data field first, then fallback to direct fields
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
              // ✅ ADDED: Include media fields in formatted data
              image_path: notif.image_path || reportData.image_path,
              evidence_images: notif.evidence_images || reportData.evidence_images || [],
              recommended_care: notif.recommended_care || reportData.recommended_care,
              // ✅ FIXED: Get detailed sighting data from the correct location
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
      
      // Update locally regardless
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally anyway
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
      
      // Update locally regardless
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })));
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Update locally anyway
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return '✅';
      case 'dismissed': return '❌';
      case 'under_review': return '🔍';
      case 'pending': return '⏳';
      default: return '📋';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
          <p className="text-xs text-gray-400 mt-1">User ID: {userId}</p>
          <p className="text-xs text-gray-400">Backend: {API_BASE_URL}</p>
        </div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <p className="text-gray-500 text-lg mb-2">Please log in to view notifications</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Notifications</h1>
              <p className="text-gray-600 mt-2">Updates about your wildlife reports</p>
              <p className="text-sm text-gray-400">User ID: {userId}</p>
              <p className="text-sm text-gray-400">Backend: {API_BASE_URL}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Refresh
              </button>      
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${
                    markingAll ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                >
                  {markingAll ? 'Marking...' : `Mark All as Read (${unreadCount})`}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-gray-600">Total Notifications</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{unreadCount}</div>
              <div className="text-gray-600">Unread</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.status === 'resolved').length}
              </div>
              <div className="text-gray-600">Resolved Reports</div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg mb-2">No notifications yet</p>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              You'll see updates here when admins review your wildlife reports. 
              Submit a sighting report first to receive notifications.
            </p>
            <button
              onClick={() => window.location.href = '/report'}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit a Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                  notification.is_read 
                    ? 'border-gray-200' 
                    : 'border-blue-300 bg-blue-50 border-l-4 border-l-blue-500'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl flex-shrink-0">
                      {getStatusIcon(notification.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {notification.species || 'Your wildlife report'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                          {notification.status.replace('_', ' ')}
                        </span>
                        {!notification.is_read && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                            New
                          </span>
                        )}
                        {notification.detection_type && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {notification.detection_type}
                          </span>
                        )}
                        {/* ✅ ADDED: Admin Update Label */}
                        {isAdminNotification(notification) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            Admin Update
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0 ml-4">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                
                {/* Message */}
                <div className={`p-4 rounded-lg border mb-4 ${
                  isAdminNotification(notification) 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  {/* ✅ ADDED: Admin Header for Admin Notifications */}
                  {isAdminNotification(notification) && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-700">Update from Wildlife Conservation Team</span>
                    </div>
                  )}
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {notification.message}
                  </p>
                  {notification.admin_notes && notification.admin_notes !== notification.message && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <p className="text-sm text-gray-600">
                        <strong>Admin notes:</strong> {notification.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* ✅ ADDED: Media Display Section - NO DUPLICATION */}
                {(() => {
                  const mediaToShow = [];
                  
                  // Add main image if it exists
                  if (notification.image_path) {
                    mediaToShow.push(notification.image_path);
                  }
                  
                  // Add evidence images that are different from main image
                  if (notification.evidence_images) {
                    notification.evidence_images.forEach(img => {
                      if (!notification.image_path || img !== notification.image_path) {
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
                })()}
                
                {/* Detection Details - Updated to include recommended_care */}
                {(notification.confidence || notification.condition || notification.conservation_status || notification.recommended_care) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detection Details:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {notification.confidence && (
                        <div>
                          <span className="font-medium">Confidence:</span> {(notification.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                      {notification.condition && (
                        <div>
                          <span className="font-medium">Condition:</span> {notification.condition}
                          {notification.condition_confidence && ` (${notification.condition_confidence}%)`}
                        </div>
                      )}
                      {notification.conservation_status && (
                        <div>
                          <span className="font-medium">Conservation:</span> {notification.conservation_status}
                        </div>
                      )}
                      {notification.habitat && (
                        <div>
                          <span className="font-medium">Habitat:</span> {notification.habitat}
                        </div>
                      )}
                      {notification.population && (
                        <div>
                          <span className="font-medium">Population:</span> {notification.population}
                        </div>
                      )}
                      {/* ✅ ADDED: Health Recommendations */}
                      {notification.recommended_care && (
                        <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-200">
                          <span className="font-medium text-blue-600">Health Recommendation:</span> 
                          <span className="ml-1">{notification.recommended_care}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ ADDED: Detailed Sighting Information Section */}
                {renderDetailedSightingInfo(notification)}
                
                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Report ID: #{notification.report_id}</span>
                    <span>•</span>
                    <span>From: Wildlife Conservation Team</span>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium whitespace-nowrap px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}