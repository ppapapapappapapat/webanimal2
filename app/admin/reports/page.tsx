'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// ✅ FIXED: Use consistent API URL for all devices
const API_URL = "http://192.168.100.77:5000";

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
  // FIXED: Detailed sighting data fields - match backend structure
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
  // FIXED: Add direct fields from sighting data
  sighting_date?: string;
  specific_location?: string;
  number_of_animals?: number;
  behavior_observed?: string;
  observer_notes?: string;
  user_contact?: string;
  urgency_level?: string;
}

type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

interface NotificationModalProps {
  report: UserReport;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string, updateStatus?: ReportStatus) => void;
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
      // ✅ FIXED: Use API_URL constant
      const response = await fetch(`${API_URL}/api/admin/notifications?report_id=${report.id}`);
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
            Message to {report.username}
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

export default function UserReports() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    critical: 0
  });
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedReportForNotification, setSelectedReportForNotification] = useState<UserReport | null>(null);

  useEffect(() => {
    fetchUserReports();
  }, [filterStatus, filterUrgency]);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching user reports...');
      
      // ✅ FIXED: Use API_URL constant
      const response = await fetch(`${API_URL}/api/user-reports`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 User reports data:', data);
        
        if (data.reports && Array.isArray(data.reports)) {
          const transformedReports = data.reports.map((report: any) => {
            // FIXED: Properly extract detailed sighting data from both sources
            const detailedData = report.detailed_sighting_data || {};
            
            // FIXED: Also include direct sighting fields for backward compatibility
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
              image_path: report.image_path,
              video_path: null,
              detection_type: report.detection_type || 'image',
              created_at: report.created_at,
              updated_at: report.updated_at,
              is_manual_report: report.is_manual_report || false,
              detection_created_at: report.detection_created_at,
              conservation_status: report.conservation_status,
              habitat: report.habitat,
              lifespan: report.lifespan,
              population: report.population,
              recommended_care: report.recommended_care,
              admin_notes: report.admin_notes,
              notification_sent: report.notification_sent,
              // FIXED: Include detailed sighting data
              detailed_sighting_data: detailedData,
              // FIXED: Also include direct fields for easy access
              sighting_date: report.sighting_date,
              specific_location: report.specific_location,
              number_of_animals: report.number_of_animals,
              behavior_observed: report.behavior_observed,
              observer_notes: report.observer_notes,
              user_contact: report.user_contact,
              urgency_level: report.urgency_level
            };
          });
          
          console.log('🔄 Transformed reports with detailed data:', transformedReports);
          setReports(transformedReports);
          
          setStats({
            total: transformedReports.length,
            pending: transformedReports.filter((r: UserReport) => r.status === 'pending').length,
            critical: transformedReports.filter((r: UserReport) => r.urgency === 'critical').length
          });
        } else {
          console.error('Invalid data format from API');
          setReports([]);
          setStats({ total: 0, pending: 0, critical: 0 });
        }
      } else {
        console.error('Failed to fetch user reports');
        await fetchSightingsFallback();
      }
    } catch (error) {
      console.error('Error fetching user reports:', error);
      await fetchSightingsFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchSightingsFallback = async () => {
    try {
      console.log('🔄 Trying fallback: fetching sightings...');
      // ✅ FIXED: Use API_URL constant
      const response = await fetch(`${API_URL}/api/sightings`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fallback sightings data:', data);
        
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
            video_path: null,
            detection_type: sighting.detection_type,
            created_at: sighting.created_at,
            updated_at: sighting.created_at,
            is_manual_report: false,
            conservation_status: sighting.conservation_status,
            habitat: sighting.habitat,
            lifespan: sighting.lifespan,
            population: sighting.population,
            recommended_care: sighting.recommended_care,
            admin_notes: sighting.admin_notes,
            notification_sent: sighting.notification_sent,
            detailed_sighting_data: {},
            sighting_date: sighting.sighting_date,
            specific_location: sighting.specific_location,
            number_of_animals: sighting.number_of_animals,
            behavior_observed: sighting.behavior_observed,
            observer_notes: sighting.observer_notes,
            user_contact: sighting.user_contact,
            urgency_level: sighting.urgency_level
          }));
          
          setReports(transformedSightings);
          setStats({
            total: transformedSightings.length,
            pending: transformedSightings.filter((r: UserReport) => r.status === 'pending').length,
            critical: transformedSightings.filter((r: UserReport) => r.urgency === 'critical').length
          });
        }
      }
    } catch (error) {
      console.error('Fallback also failed:', error);
      setReports([]);
      setStats({ total: 0, pending: 0, critical: 0 });
    }
  };

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const urgencyMatch = filterUrgency === 'all' || report.urgency === filterUrgency;
    return statusMatch && urgencyMatch;
  });

  const updateReportStatus = async (reportId: number, newStatus: ReportStatus) => {
    try {
      console.log(`🔄 Updating report ${reportId} to ${newStatus}`);
      
      // ✅ FIXED: Use API_URL constant
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        console.log('✅ Report status updated via API');
        await fetchUserReports();
        if (selectedReport?.id === reportId) {
          const updatedReport = { ...selectedReport, status: newStatus };
          setSelectedReport(updatedReport);
        }
      } else {
        console.error('Failed to update report status');
        setReports(reports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        ));
        if (selectedReport?.id === reportId) {
          setSelectedReport({ ...selectedReport, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating report status:', error);
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
      // ✅ FIXED: Combine both operations into a single API call
      const notificationData: any = {
        message,
        admin_notes: message,
        report_data: {
          species: selectedReportForNotification.species,
          confidence: selectedReportForNotification.confidence,
          condition: selectedReportForNotification.condition,
          condition_confidence: selectedReportForNotification.condition_confidence,
          conservation_status: selectedReportForNotification.conservation_status,
          habitat: selectedReportForNotification.habitat,
          population: selectedReportForNotification.population,
          recommended_care: selectedReportForNotification.recommended_care,
          detailed_sighting_data: selectedReportForNotification.detailed_sighting_data || {},
          sighting_date: selectedReportForNotification.sighting_date,
          specific_location: selectedReportForNotification.specific_location,
          number_of_animals: selectedReportForNotification.number_of_animals,
          behavior_observed: selectedReportForNotification.behavior_observed,
          observer_notes: selectedReportForNotification.observer_notes,
          urgency_level: selectedReportForNotification.urgency_level
        }
      };

      // Add status update if provided
      if (updateStatus) {
        notificationData.status = updateStatus;
      }

      console.log('📤 Sending notification with admin notes and detailed data:', notificationData);
      
      // ✅ FIXED: Use API_URL constant
      const notifyResponse = await fetch(`${API_URL}/api/reports/${selectedReportForNotification.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });

      if (notifyResponse.ok) {
        console.log('✅ Notification sent to user with admin notes saved');
        
        // ✅ FIXED: Also update the report with admin notes via PATCH
        try {
          const updateData = {
            admin_notes: message,
            ...(updateStatus && { status: updateStatus })
          };
          
          // ✅ FIXED: Use API_URL constant
          await fetch(`${API_URL}/api/reports/${selectedReportForNotification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          });
          console.log('✅ Admin notes saved to report');
        } catch (updateError) {
          console.warn('⚠️ Could not update report with admin notes, but notification was sent:', updateError);
        }
        
        // Refresh the reports list
        await fetchUserReports();
        
        // Update the selected report locally if it's the same one
        if (selectedReport?.id === selectedReportForNotification.id) {
          const updatedReport = {
            ...selectedReport,
            admin_notes: message,
            status: updateStatus || selectedReport.status,
            updated_at: new Date().toISOString()
          };
          setSelectedReport(updatedReport);
        }
        
        setNotificationModalOpen(false);
        setSelectedReportForNotification(null);
        
        alert('Notification sent successfully and admin notes saved!');
      } else {
        const errorText = await notifyResponse.text();
        console.error('Failed to send notification:', errorText);
        
        // ✅ FIXED: Fallback - try to save admin notes directly if notification fails
        try {
          const updateData = {
            admin_notes: message,
            ...(updateStatus && { status: updateStatus })
          };
          
          // ✅ FIXED: Use API_URL constant
          const fallbackResponse = await fetch(`${API_URL}/api/reports/${selectedReportForNotification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          });
          
          if (fallbackResponse.ok) {
            console.log('✅ Admin notes saved via fallback');
            await fetchUserReports();
            alert('Admin notes saved, but notification failed to send.');
          } else {
            throw new Error('Fallback also failed');
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          alert('Error: Could not save admin notes or send notification.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing request. Please check your connection.');
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

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'endangered': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'illegal_activity': return 'bg-red-100 text-red-800 border-red-200';
      case 'habitat_concern': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sighting': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMediaUrl = (filename: string | null) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    // ✅ FIXED: Use API_URL constant
    return `${API_URL}/api/uploaded-images/${filename}`;
  };

  const isVideoFile = (filename: string | null) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // FIXED: Format detailed sighting information for display
  const renderDetailedSightingInfo = (report: UserReport) => {
    // FIXED: Check both detailed_sighting_data and direct fields
    const detailedData = report.detailed_sighting_data || {};
    
    // FIXED: Use data from both sources
    const sightingDate = detailedData.sighting_date || report.sighting_date;
    const specificLocation = detailedData.specific_location || report.specific_location;
    const numberOfAnimals = detailedData.number_of_animals || report.number_of_animals;
    const behaviorObserved = detailedData.behavior_observed || report.behavior_observed;
    const observerNotes = detailedData.observer_notes || report.observer_notes;
    const userContact = detailedData.user_contact || report.user_contact;
    const urgencyLevel = detailedData.urgency_level || report.urgency_level;
    const reporterName = detailedData.reporter_name;

    // FIXED: Check if we have any detailed data to show
    const hasDetailedData = sightingDate || specificLocation || numberOfAnimals || 
                           behaviorObserved || observerNotes || userContact || 
                           urgencyLevel || reporterName;

    if (!hasDetailedData) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Detailed Sighting Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {sightingDate && (
            <div>
              <span className="text-gray-600">Sighting Date:</span>
              <span className="ml-1 font-medium">
                {new Date(sightingDate).toLocaleString()}
              </span>
            </div>
          )}
          {specificLocation && (
            <div>
              <span className="text-gray-600">Specific Location:</span>
              <span className="ml-1 font-medium">{specificLocation}</span>
            </div>
          )}
          {numberOfAnimals && (
            <div>
              <span className="text-gray-600">Number of Animals:</span>
              <span className="ml-1 font-medium">{numberOfAnimals}</span>
            </div>
          )}
          {behaviorObserved && (
            <div>
              <span className="text-gray-600">Behavior Observed:</span>
              <span className="ml-1 font-medium">{behaviorObserved}</span>
            </div>
          )}
          {observerNotes && (
            <div className="md:col-span-2">
              <span className="text-gray-600">Observer Notes:</span>
              <p className="ml-1 font-medium mt-1 bg-gray-50 p-2 rounded whitespace-pre-wrap">{observerNotes}</p>
            </div>
          )}
          {userContact && (
            <div>
              <span className="text-gray-600">Contact Info:</span>
              <span className="ml-1 font-medium">{userContact}</span>
            </div>
          )}
          {reporterName && (
            <div>
              <span className="text-gray-600">Reporter Name:</span>
              <span className="ml-1 font-medium">{reporterName}</span>
            </div>
          )}
          {urgencyLevel && (
            <div>
              <span className="text-gray-600">Urgency Level:</span>
              <span className={`ml-1 font-medium px-2 py-1 rounded text-xs ${
                urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {urgencyLevel}
              </span>
            </div>
          )}
        </div>
      </div>
    );
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Animal Sightings Reports</h1>
          <p className="text-gray-600 mt-2">
            Review and manage wildlife sightings submitted by users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="text-gray-600">Critical</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value as UrgencyLevel | 'all')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Urgency</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredReports.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg mb-2">No reports found</p>
                  <p className="text-gray-400 text-sm">
                    {reports.length === 0 
                      ? "No user reports have been submitted yet." 
                      : "No reports match your current filters."}
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 ${
                      selectedReport?.id === report.id 
                        ? 'border-blue-500 ring-2 ring-blue-100 transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{report.species}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getReportTypeColor(report.report_type)}`}>
                            {report.report_type.replace('_', ' ')}
                          </span>
                          {report.is_manual_report && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                              Manual Report
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(report.urgency)}`}>
                          {report.urgency}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {/* ✅ FIXED: Replace description with formatted text when condition exists */}
                    <p className="text-sm text-gray-700 mb-3">
                      {report.condition && report.condition !== 'Unknown' 
                        ? `User reported sighting of ${report.species} with condition of ${report.condition} with ${(report.confidence * 100).toFixed(1)}% confidence.`
                        : report.description
                      }
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>By: {report.username}</span>
                        <span>Type: {report.detection_type}</span>
                        {report.image_path && (
                          <span className="flex items-center gap-1">
                            {isVideoFile(report.image_path) ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Video Available
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Image Available
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Report Details</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedReport.image_path && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {isVideoFile(selectedReport.image_path) ? 'Detection Video' : 'Detection Image'}
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {isVideoFile(selectedReport.image_path) ? (
                          <video 
                            src={getMediaUrl(selectedReport.image_path)!}
                            controls
                            className="w-full h-48 object-cover rounded-md"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <ImageWithFallback 
                            src={getMediaUrl(selectedReport.image_path)!}
                            alt={`Detection of ${selectedReport.species}`}
                            className="w-full h-48 object-cover rounded-md"
                          />
                        )}
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Uploaded: {new Date(selectedReport.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Animal Information</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-gray-900 text-lg">{selectedReport.species}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <span className="ml-1 font-medium capitalize">{selectedReport.condition}</span>
                        </div>
                        {/* ✅ FIXED: Removed condition confidence display */}
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-1 font-medium capitalize">{selectedReport.detection_type}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Detection Confidence:</span>
                          <span className="ml-1 font-medium">{(selectedReport.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      {(selectedReport.conservation_status || selectedReport.habitat || selectedReport.lifespan || selectedReport.population) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {selectedReport.conservation_status && (
                            <p className="text-sm">
                              <span className="text-gray-600">Conservation:</span>
                              <span className="ml-1 font-medium">{selectedReport.conservation_status}</span>
                            </p>
                          )}
                          {selectedReport.habitat && (
                            <p className="text-sm">
                              <span className="text-gray-600">Habitat:</span>
                              <span className="ml-1 font-medium">{selectedReport.habitat}</span>
                            </p>
                          )}
                          {selectedReport.lifespan && (
                            <p className="text-sm">
                              <span className="text-gray-600">Lifespan:</span>
                              <span className="ml-1 font-medium">{selectedReport.lifespan}</span>
                            </p>
                          )}
                          {selectedReport.population && (
                            <p className="text-sm">
                              <span className="text-gray-600">Population:</span>
                              <span className="ml-1 font-medium">{selectedReport.population}</span>
                            </p>
                          )}
                          {selectedReport.recommended_care && (
                            <p className="text-sm mt-2">
                              <span className="text-gray-600">Recommended Care:</span>
                              <span className="ml-1 font-medium text-blue-600">{selectedReport.recommended_care}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIXED: Detailed Sighting Information Section */}
                  {renderDetailedSightingInfo(selectedReport)}

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Reporter</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedReport.username}</p>
                      <p className="text-sm text-gray-600">{selectedReport.email}</p>
                      <p className="text-xs text-gray-500 mt-1">User ID: {selectedReport.user_id}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Report Details</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2 text-base">{selectedReport.title}</p>
                      {/* ✅ FIXED: Use the new formatted text as the only content - no duplicate description */}
                      <p className="text-base text-gray-800 font-medium">
                        {selectedReport.condition && selectedReport.condition !== 'Unknown' 
                          ? `User reported sighting of ${selectedReport.species} with condition of ${selectedReport.condition} with ${(selectedReport.confidence * 100).toFixed(1)}% confidence.`
                          : `User reported sighting of ${selectedReport.species} with ${(selectedReport.confidence * 100).toFixed(1)}% confidence.`
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Detection Info</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p>Detection Type: <span className="capitalize">{selectedReport.detection_type}</span></p>
                      <p>Reported: {new Date(selectedReport.created_at).toLocaleString()}</p>
                      {selectedReport.updated_at !== selectedReport.created_at && (
                        <p>Updated: {new Date(selectedReport.updated_at).toLocaleString()}</p>
                      )}
                      {selectedReport.is_manual_report ? (
                        <p className="text-purple-600 font-medium">Manual User Report</p>
                      ) : (
                        <p className="text-blue-600 font-medium">Automated Detection</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">User Communication</h3>
                    <button
                      onClick={() => {
                        setSelectedReportForNotification(selectedReport);
                        setNotificationModalOpen(true);
                      }}
                      className="w-full px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 01-2-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Send Update to User
                    </button>
                    {selectedReport.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Last Admin Note:</p>
                        <p className="text-sm text-blue-700">{selectedReport.admin_notes}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Updated: {new Date(selectedReport.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-sm">Select a report to view details</p>
                {reports.length > 0 && (
                  <p className="text-gray-400 text-xs mt-2">
                    {reports.length} reports available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

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