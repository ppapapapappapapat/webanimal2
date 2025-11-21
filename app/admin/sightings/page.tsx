'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// ✅ FIXED: Use consistent API URL for all devices
const API_URL = "http://192.168.100.77:5000";

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
}

interface User {
  id: number;
  username: string;
  email: string;
  report_count: number;
  last_report_date: string;
  sightings: Sighting[];
}

type SightingStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
type DetectionType = 'image' | 'video' | 'real-time' | 'manual_report' | 'all';

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

const VideoPlayer = ({ src, className }: { src: string; className: string }) => {
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

export default function AllSightings() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [selectedSightings, setSelectedSightings] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<SightingStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DetectionType>('all');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [filterConservation, setFilterConservation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sightingToDelete, setSightingToDelete] = useState<Sighting | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSightings: 0,
    pending: 0,
    endangered: 0,
    imageDetections: 0,
    videoDetections: 0,
    realtimeDetections: 0,
    manualReports: 0,
    uniqueSpecies: 0
  });

  useEffect(() => {
    fetchAllSightings();
  }, []);

  const fetchAllSightings = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching complete sightings database...');
      
      // ✅ FIXED: Use API_URL constant for both fetch calls
      const [reportsResponse, sightingsResponse] = await Promise.all([
        fetch(`${API_URL}/api/user-reports`),
        fetch(`${API_URL}/api/sightings`)
      ]);

      let allSightings: Sighting[] = [];

      // Process user reports
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        if (reportsData.reports && Array.isArray(reportsData.reports)) {
          const transformedReports = reportsData.reports.map((report: any) => ({
            id: report.id,
            user_id: report.user_id,
            username: report.user_name,
            email: report.user_email,
            species: report.species || 'Unknown Species',
            confidence: report.confidence || 0,
            condition: report.condition || 'Unknown',
            condition_confidence: report.condition_confidence || 0,
            detection_type: report.detection_type || 'manual_report',
            image_path: report.image_path,
            video_path: report.video_path || null,
            location_lat: report.location_lat,
            location_lng: report.location_lng,
            created_at: report.created_at,
            updated_at: report.updated_at,
            conservation_status: report.conservation_status,
            habitat: report.habitat,
            population: report.population,
            recommended_care: report.recommended_care,
            admin_notes: report.admin_notes,
            status: report.status || 'pending',
            is_manual_report: true,
            title: report.title,
            description: report.description,
            report_type: report.report_type
          }));
          allSightings = [...allSightings, ...transformedReports];
        }
      }

      // Process automated sightings - FIXED: Remove the ID offset
      if (sightingsResponse.ok) {
        const sightingsData = await sightingsResponse.json();
        if (sightingsData.sightings && Array.isArray(sightingsData.sightings)) {
          const transformedSightings = sightingsData.sightings.map((sighting: any) => ({
            id: sighting.id, // ✅ FIXED: Use actual database ID instead of +100000
            user_id: sighting.user_id || 0,
            username: sighting.user?.username || 'System',
            email: sighting.user?.email || 'system@wildlife.com',
            species: sighting.species,
            confidence: sighting.confidence,
            condition: sighting.condition || 'Unknown',
            condition_confidence: sighting.condition_confidence || 0,
            detection_type: sighting.detection_type,
            image_path: sighting.image_path,
            video_path: sighting.video_path || null,
            location_lat: sighting.location_lat,
            location_lng: sighting.location_lng,
            created_at: sighting.created_at,
            updated_at: sighting.updated_at || sighting.created_at,
            conservation_status: sighting.conservation_status,
            habitat: sighting.habitat,
            population: sighting.population,
            recommended_care: sighting.recommended_care,
            admin_notes: sighting.admin_notes,
            status: sighting.status || 'pending',
            is_manual_report: false,
            title: `Automated Detection: ${sighting.species}`,
            description: `Automated ${sighting.detection_type} detection of ${sighting.species} with ${(sighting.confidence * 100).toFixed(1)}% confidence`,
            report_type: 'sighting'
          }));
          allSightings = [...allSightings, ...transformedSightings];
        }
      }

      // Group sightings by user
      const usersMap = new Map<number, User>();
      
      allSightings.forEach(sighting => {
        if (!usersMap.has(sighting.user_id)) {
          usersMap.set(sighting.user_id, {
            id: sighting.user_id,
            username: sighting.username,
            email: sighting.email,
            report_count: 0,
            last_report_date: sighting.created_at,
            sightings: []
          });
        }
        
        const user = usersMap.get(sighting.user_id)!;
        user.sightings.push(sighting);
        user.report_count++;
        
        // Update last report date if this is newer
        if (new Date(sighting.created_at) > new Date(user.last_report_date)) {
          user.last_report_date = sighting.created_at;
        }
      });

      // Convert map to array and sort by report count (descending)
      const usersArray = Array.from(usersMap.values()).sort((a, b) => b.report_count - a.report_count);

      console.log('📋 Users with sightings:', usersArray);
      setUsers(usersArray);
      calculateStats(usersArray);
      setSelectedSightings(new Set()); // Reset selections when data reloads
    } catch (error) {
      console.error('Error fetching complete sightings database:', error);
      setUsers([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersList: User[]) => {
    const allSightings = usersList.flatMap(user => user.sightings);
    const uniqueSpecies = new Set(allSightings.map(s => s.species));
    const endangeredCount = allSightings.filter(s => 
      s.conservation_status && 
      ['Endangered', 'Critically Endangered', 'Vulnerable'].includes(s.conservation_status)
    ).length;

    setStats({
      totalUsers: usersList.length,
      totalSightings: allSightings.length,
      pending: allSightings.filter(s => s.status === 'pending').length,
      endangered: endangeredCount,
      imageDetections: allSightings.filter(s => s.detection_type === 'image').length,
      videoDetections: allSightings.filter(s => s.detection_type === 'video').length,
      realtimeDetections: allSightings.filter(s => s.detection_type === 'real-time').length,
      manualReports: allSightings.filter(s => s.is_manual_report).length,
      uniqueSpecies: uniqueSpecies.size
    });
  };

  const getFilteredSightings = (user: User) => {
    return user.sightings.filter(sighting => {
      const statusMatch = filterStatus === 'all' || sighting.status === filterStatus;
      const typeMatch = filterType === 'all' || sighting.detection_type === filterType;
      const speciesMatch = filterSpecies === 'all' || sighting.species === filterSpecies;
      const conservationMatch = filterConservation === 'all' || sighting.conservation_status === filterConservation;
      
      // Search term filter (species, description)
      const searchMatch = !searchTerm || 
        sighting.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sighting.description && sighting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sighting.habitat && sighting.habitat.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Date range filter
      const sightingDate = new Date(sighting.created_at);
      const dateMatch = (!dateRange.start || sightingDate >= new Date(dateRange.start)) &&
                       (!dateRange.end || sightingDate <= new Date(dateRange.end + 'T23:59:59'));

      return statusMatch && typeMatch && speciesMatch && conservationMatch && searchMatch && dateMatch;
    });
  };

  // Selection handlers
  const toggleSightingSelection = (sightingId: number) => {
    setSelectedSightings(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(sightingId)) {
        newSelection.delete(sightingId);
      } else {
        newSelection.add(sightingId);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = (sightings: Sighting[]) => {
    if (selectedSightings.size === sightings.length) {
      // Deselect all
      setSelectedSightings(new Set());
    } else {
      // Select all
      const allIds = new Set(sightings.map(s => s.id));
      setSelectedSightings(allIds);
    }
  };

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

  // Export functions
  const exportToCSV = async (sightingsToExport?: Sighting[]) => {
    try {
      setExportLoading(true);
      const exportSightings = sightingsToExport || users.flatMap(user => user.sightings);
      
      const csvHeaders = [
        'ID',
        'Species',
        'Confidence',
        'Condition',
        'Condition Confidence',
        'Detection Type',
        'Location',
        'User',
        'User Email',
        'Timestamp',
        'Conservation Status',
        'Habitat',
        'Population',
        'Status',
        'Report Type'
      ].join(',');

      const csvRows = exportSightings.map(sighting => [
        sighting.id,
        `"${sighting.species}"`,
        (sighting.confidence * 100).toFixed(1) + '%',
        sighting.condition,
        sighting.condition_confidence + '%',
        sighting.detection_type,
        sighting.location_lat && sighting.location_lng 
          ? `"${sighting.location_lat}, ${sighting.location_lng}"`
          : 'N/A',
        `"${sighting.username}"`,
        `"${sighting.email}"`,
        `"${new Date(sighting.created_at).toLocaleString()}"`,
        sighting.conservation_status || 'N/A',
        `"${sighting.habitat || 'N/A'}"`,
        `"${sighting.population || 'N/A'}"`,
        sighting.status,
        sighting.report_type || 'N/A'
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const suffix = sightingsToExport ? `-selected-${sightingsToExport.length}` : '-all';
      link.download = `wildlife-sightings${suffix}-${new Date().toISOString().split('T')[0]}.csv`;
      
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

  const exportSelectedSightings = () => {
    const selectedSightingsList = users.flatMap(user => user.sightings)
      .filter(sighting => selectedSightings.has(sighting.id));
    
    if (selectedSightingsList.length === 0) {
      alert('Please select at least one sighting to export.');
      return;
    }
    
    exportToCSV(selectedSightingsList);
  };

  // Delete functions - FIXED VERSION
  const deleteSighting = async (sightingId: number) => {
    try {
      setDeleteLoading(sightingId);
      
      // Determine if it's a manual report or automated sighting
      const sighting = users.flatMap(user => user.sightings).find(s => s.id === sightingId);
      const isManualReport = sighting?.is_manual_report;
      
      console.log('🗑️ DELETE Request Details:', {
        sightingId,
        isManualReport,
        sightingType: sighting?.detection_type,
        species: sighting?.species
      });
      
      // ✅ FIXED: Use API_URL constant
      const endpoint = isManualReport 
        ? `${API_URL}/api/reports/${sightingId}`
        : `${API_URL}/api/sightings/${sightingId}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      console.log('📨 DELETE Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (response.ok) {
        console.log('✅ Sighting deleted successfully');
        await fetchAllSightings(); // Refresh the data
        setShowDeleteModal(false);
        setSightingToDelete(null);
        
        // Clear selection if this sighting was selected
        setSelectedSightings(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(sightingId);
          return newSelection;
        });
      } else {
        const errorText = await response.text();
        console.error('❌ DELETE failed:', response.status, errorText);
        throw new Error(`Failed to delete sighting: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting sighting:', error);
      alert('Error deleting sighting. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const deleteSelectedSightings = async () => {
    try {
      setBulkDeleteLoading(true);
      
      const deletePromises = Array.from(selectedSightings).map(sightingId => {
        const sighting = users.flatMap(user => user.sightings).find(s => s.id === sightingId);
        const isManualReport = sighting?.is_manual_report;
        // ✅ FIXED: Use API_URL constant
        const endpoint = isManualReport 
          ? `${API_URL}/api/reports/${sightingId}`
          : `${API_URL}/api/sightings/${sightingId}`;
        
        return fetch(endpoint, { method: 'DELETE' });
      });

      const results = await Promise.allSettled(deletePromises);
      const successfulDeletes = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      
      console.log(`✅ ${successfulDeletes} sightings deleted successfully`);
      await fetchAllSightings(); // Refresh the data
      setShowBulkDeleteModal(false);
      
      if (successfulDeletes === selectedSightings.size) {
        alert(`Successfully deleted ${successfulDeletes} sightings.`);
      } else {
        alert(`Deleted ${successfulDeletes} out of ${selectedSightings.size} selected sightings.`);
      }
    } catch (error) {
      console.error('Error deleting selected sightings:', error);
      alert('Error deleting sightings. Please try again.');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const openDeleteModal = (sighting: Sighting) => {
    setSightingToDelete(sighting);
    setShowDeleteModal(true);
  };

  const openBulkDeleteModal = () => {
    if (selectedSightings.size === 0) {
      alert('Please select at least one sighting to delete.');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const uniqueSpecies = Array.from(new Set(users.flatMap(user => user.sightings.map(s => s.species)))).sort();
  const uniqueConservation = Array.from(new Set(users.flatMap(user => user.sightings.map(s => s.conservation_status).filter(Boolean)))).sort();
  const uniqueTypes = Array.from(new Set(users.flatMap(user => user.sightings.map(s => s.detection_type)))).sort();

  // Get current filtered sightings for the selected user
  const currentFilteredSightings = selectedUser ? getFilteredSightings(selectedUser) : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading complete sightings database...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Users & Sightings</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive view of all users and their wildlife sightings and reports
              </p>
            </div>
            <div className="flex gap-2">
              {/* Export Buttons */}
              {selectedSightings.size > 0 && (
                <button
                  onClick={exportSelectedSightings}
                  disabled={exportLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                      Export Selected ({selectedSightings.size})
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => exportToCSV()}
                disabled={exportLoading || stats.totalSightings === 0}
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
                    Export All CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-gray-600 text-sm">Total Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-purple-600">{stats.totalSightings}</div>
            <div className="text-gray-600 text-sm">Total Reports</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-orange-600">{stats.endangered}</div>
            <div className="text-gray-600 text-sm">Endangered</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-green-600">{stats.imageDetections}</div>
            <div className="text-gray-600 text-sm">Image</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-purple-600">{stats.videoDetections}</div>
            <div className="text-gray-600 text-sm">Video</div>
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

        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Advanced Filtering & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Species, description, habitat..."
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Users ({users.length})
              </h3>
              <span className="text-sm text-gray-500">
                {stats.totalSightings} total reports
              </span>
            </div>

            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <p className="text-gray-500 text-lg mb-2">No users found</p>
                  <p className="text-gray-400 text-sm">
                    No users have submitted reports yet.
                  </p>
                </div>
              ) : (
                users.map((user) => {
                  const filteredSightings = getFilteredSightings(user);
                  if (filteredSightings.length === 0 && (filterStatus !== 'all' || filterType !== 'all' || searchTerm)) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={user.id}
                      className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 ${
                        selectedUser?.id === user.id 
                          ? 'border-blue-500 ring-2 ring-blue-100 transform scale-[1.02]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{user.username}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {user.report_count} reports
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>User ID: {user.id}</span>
                        <span>Last report: {new Date(user.last_report_date).toLocaleDateString()}</span>
                      </div>

                      {filteredSightings.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            Filtered reports: {filteredSightings.length}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* User's Sightings or Detailed View */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="space-y-4">
                {/* User Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedUser.username}'s Reports</h2>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{selectedUser.report_count}</div>
                      <div className="text-gray-600">Total Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {selectedUser.sightings.filter(s => s.status === 'resolved').length}
                      </div>
                      <div className="text-gray-600">Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {selectedUser.sightings.filter(s => s.status === 'pending').length}
                      </div>
                      <div className="text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {new Set(selectedUser.sightings.map(s => s.species)).size}
                      </div>
                      <div className="text-gray-600">Species</div>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedSightings.size > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800 font-medium">
                          {selectedSightings.size} reports selected
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={exportSelectedSightings}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            Export Selected
                          </button>
                          <button
                            onClick={openBulkDeleteModal}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            Delete Selected
                          </button>
                          <button
                            onClick={() => setSelectedSightings(new Set())}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User's Sightings List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Reports ({currentFilteredSightings.length})
                    </h3>
                    {currentFilteredSightings.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSelectAll(currentFilteredSightings)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {selectedSightings.size === currentFilteredSightings.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    )}
                  </div>

                  {currentFilteredSightings.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                      <div className="text-gray-400 text-6xl mb-4">📋</div>
                      <p className="text-gray-500 text-lg mb-2">No reports match filters</p>
                      <p className="text-gray-400 text-sm">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  ) : (
                    currentFilteredSightings.map((sighting) => (
                      <div
                        key={sighting.id}
                        className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 ${
                          selectedSighting?.id === sighting.id 
                            ? 'border-blue-500 ring-2 ring-blue-100 transform scale-[1.02]' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${selectedSightings.has(sighting.id) ? 'bg-blue-50 border-blue-300' : ''}`}
                        onClick={(e) => {
                          // Don't trigger selection when clicking delete button
                          if ((e.target as HTMLElement).closest('button')) return;
                          setSelectedSighting(sighting);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox for selection */}
                          <input
                            type="checkbox"
                            checked={selectedSightings.has(sighting.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSightingSelection(sighting.id);
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />

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
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(sighting.status)}`}>
                                  {sighting.status.replace('_', ' ')}
                                </span>
                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(sighting);
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  title="Delete this report"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
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
              </div>
            ) : selectedSighting ? (
              /* Single Sighting Detail View */
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Report Details</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDeleteModal(selectedSighting)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedSighting(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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
                      </div>
                      
                      {/* Location */}
                      {selectedSighting.location_lat && selectedSighting.location_lng && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm">
                            <span className="text-gray-600">Location:</span>
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
                      {(selectedSighting.conservation_status || selectedSighting.habitat) && (
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

                  {/* Reporter Information */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Reporter Information</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedSighting.username}</p>
                      <p className="text-sm text-gray-600">{selectedSighting.email}</p>
                      <p className="text-xs text-gray-500 mt-1">User ID: {selectedSighting.user_id}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSighting.status)}`}>
                          {selectedSighting.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDetectionTypeColor(selectedSighting.detection_type)}`}>
                          {selectedSighting.detection_type === 'manual_report' ? 'Manual Report' : selectedSighting.detection_type}
                        </span>
                      </div>
                    </div>
                  </div>

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
                </div>
              </div>
            ) : (
              /* Default State - No Selection */
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg mb-2">Select a user to view their reports</p>
                <p className="text-gray-400 text-sm">
                  {users.length} users with {stats.totalSightings} total reports in the system
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sightingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the report for <strong>{sightingToDelete.species}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSightingToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSighting(sightingToDelete.id)}
                disabled={deleteLoading === sightingToDelete.id}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading === sightingToDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{selectedSightings.size}</strong> selected reports?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedSightings}
                disabled={bulkDeleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {bulkDeleteLoading ? 'Deleting...' : `Delete ${selectedSightings.size} Reports`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}