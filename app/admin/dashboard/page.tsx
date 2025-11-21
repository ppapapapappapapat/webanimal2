'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';

// ✅ FIXED: Use the same API URL as animaldetection.tsx
const API_URL = "http://192.168.100.77:5000";

interface DashboardStats {
  totalReports: number;
  pendingReview: number;
  criticalReports: number;
  verifiedReports: number;
  endangeredSpeciesCount: number;
  totalUsers: number;
  recentActivity: number;
  reportsByType: Record<string, number>;
  reportsByStatus: Record<string, number>;
}

interface RecentReport {
  id: number;
  species: string;
  condition: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  username: string;
  created_at: string;
  location?: string;
  detection_type: string;
  confidence: number;
  condition_confidence: number;
}

interface ActivityItem {
  id: number;
  type: 'report_submitted' | 'status_updated' | 'notification_sent' | 'user_registered';
  description: string;
  timestamp: string;
  user?: string;
}

interface SpeciesStats {
  species: string;
  count: number;
  lastSeen: string;
  conservation_status?: string;
}

interface ReportsResponse {
  reports: any[];
  total: number;
}

interface SightingsResponse {
  sightings: any[];
  total: number;
}

interface UsersCountResponse {
  count: number;
}

interface ReportStatsResponse {
  total_reports: number;
  pending_reports: number;
  critical_reports: number;
  reports_by_type: Record<string, number>;
  reports_by_status: Record<string, number>;
}

export default function DashboardOverview() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReview: 0,
    criticalReports: 0,
    verifiedReports: 0,
    endangeredSpeciesCount: 0,
    totalUsers: 0,
    recentActivity: 0,
    reportsByType: {},
    reportsByStatus: {}
  });
  
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [speciesStats, setSpeciesStats] = useState<SpeciesStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return {
      start: startDate.toISOString(),
      end: now.toISOString()
    };
  };

  const filterDataByDateRange = (data: any[], dateField: string = 'created_at') => {
    const { start } = getDateRange();
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const startDate = new Date(start);
      return itemDate >= startDate;
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ FIXED: Use the same API URL as animaldetection.tsx
      const [reportsResponse, sightingsResponse, usersResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/user-reports`),
        fetch(`${API_URL}/api/sightings`),
        fetch(`${API_URL}/api/admin/users/count`).catch(() => null),
        fetch(`${API_URL}/api/reports/stats`)
      ]);

      let allReports: any[] = [];
      let allSightings: any[] = [];
      let usersCount = 0;
      let reportStats: ReportStatsResponse = {
        total_reports: 0,
        pending_reports: 0,
        critical_reports: 0,
        reports_by_type: {},
        reports_by_status: {}
      };

      if (reportsResponse.ok) {
        const reportsData: ReportsResponse = await reportsResponse.json();
        allReports = reportsData.reports || [];
      }

      if (sightingsResponse.ok) {
        const sightingsData: SightingsResponse = await sightingsResponse.json();
        allSightings = sightingsData.sightings || [];
      }

      if (usersResponse?.ok) {
        const usersData: UsersCountResponse = await usersResponse.json();
        usersCount = usersData.count || 0;
      } else {
        const uniqueUserIds = new Set(allReports.map((report: any) => report.user_id));
        usersCount = uniqueUserIds.size;
      }

      if (statsResponse.ok) {
        const statsData: ReportStatsResponse = await statsResponse.json();
        reportStats = statsData;
      }

      const filteredReports = filterDataByDateRange(allReports);
      const filteredSightings = filterDataByDateRange(allSightings);

      const pendingCount = filteredReports.filter((report: any) => 
        report.status === 'pending'
      ).length;
      
      const criticalCount = filteredReports.filter((report: any) => 
        report.urgency === 'critical'
      ).length;
      
      const verifiedCount = filteredReports.filter((report: any) => 
        report.status === 'resolved' || report.status === 'under_review'
      ).length;

      const endangeredSpecies = filteredSightings.filter((sighting: any) => 
        sighting.conservation_status && 
        ['Endangered', 'Critically Endangered', 'Vulnerable'].includes(sighting.conservation_status)
      );
      
      const uniqueEndangeredSpecies = new Set(endangeredSpecies.map((s: any) => s.species));

      const speciesCounts: Record<string, { count: number, lastSeen: string, conservation_status?: string }> = {};
      filteredSightings.forEach((sighting: any) => {
        const species = sighting.species;
        if (!speciesCounts[species]) {
          speciesCounts[species] = {
            count: 0,
            lastSeen: sighting.created_at,
            conservation_status: sighting.conservation_status
          };
        }
        speciesCounts[species].count++;
        if (new Date(sighting.created_at) > new Date(speciesCounts[species].lastSeen)) {
          speciesCounts[species].lastSeen = sighting.created_at;
        }
      });

      const topSpecies = Object.entries(speciesCounts)
        .map(([species, data]) => ({
          species,
          count: data.count,
          lastSeen: data.lastSeen,
          conservation_status: data.conservation_status
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalReports: filteredReports.length,
        pendingReview: pendingCount,
        criticalReports: criticalCount,
        verifiedReports: verifiedCount,
        endangeredSpeciesCount: uniqueEndangeredSpecies.size,
        totalUsers: usersCount,
        recentActivity: filteredReports.length,
        reportsByType: reportStats.reports_by_type || {},
        reportsByStatus: reportStats.reports_by_status || {}
      });

      const sortedReports = filteredReports
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((report: any) => ({
          id: report.id,
          species: report.species,
          condition: report.condition || 'Unknown',
          urgency: report.urgency || 'medium',
          status: report.status || 'pending',
          username: report.user_name || 'Unknown',
          created_at: report.created_at,
          location: report.location_name || 'Unknown location',
          detection_type: report.detection_type || 'manual_report',
          confidence: report.confidence || 0,
          condition_confidence: report.condition_confidence || 0
        }));

      setRecentReports(sortedReports);
      setSpeciesStats(topSpecies);

      const recentActivities = sortedReports.map((report: RecentReport, index: number) => ({
        id: index + 1,
        type: 'report_submitted' as const,
        description: `New ${report.detection_type} report: ${report.species}`,
        timestamp: report.created_at,
        user: report.username
      }));

      setActivities(recentActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    setStats({
      totalReports: 0,
      pendingReview: 0,
      criticalReports: 0,
      verifiedReports: 0,
      endangeredSpeciesCount: 0,
      totalUsers: 0,
      recentActivity: 0,
      reportsByType: {},
      reportsByStatus: {}
    });
    setRecentReports([]);
    setActivities([]);
    setSpeciesStats([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConservationColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'endangered':
      case 'critically endangered':
        return 'bg-red-100 text-red-800';
      case 'vulnerable':
        return 'bg-orange-100 text-orange-800';
      case 'near threatened':
        return 'bg-yellow-100 text-yellow-800';
      case 'least concern':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report_submitted': return '📋';
      case 'status_updated': return '✅';
      case 'notification_sent': return '📢';
      case 'user_registered': return '👤';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'today': return 'Last 24 Hours';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      default: return 'Last 7 Days';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Real-time wildlife sightings and reports monitoring • <span className="font-medium">{getTimeRangeText()}</span>
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              Showing data from {getTimeRangeText().toLowerCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeRangeText()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingReview}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalReports > 0 ? Math.round((stats.pendingReview / stats.totalReports) * 100) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Reports</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalReports}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Needs immediate attention
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Endangered Species</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.endangeredSpeciesCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Protected species sightings
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">🦋</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                  <Link href="/admin/reports" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All Reports →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reports found in {getTimeRangeText().toLowerCase()}</p>
                    <p className="text-sm mt-1">Reports will appear here as users submit them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{report.species}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency)}`}>
                              {report.urgency}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Condition: {report.condition} ({(report.condition_confidence).toFixed(1)}%) • By: {report.username}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {report.detection_type.replace('_', ' ')} • {formatDate(report.created_at)}
                          </p>
                        </div>
                        <Link 
                          href={`/admin/reports`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Review
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Species ({getTimeRangeText()})</h2>
              </div>
              <div className="p-6">
                {speciesStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No species detected in {getTimeRangeText().toLowerCase()}</p>
                    <p className="text-sm mt-1">Species will appear here as they are detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {speciesStats.map((species, index) => (
                      <div key={species.species} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-500 w-6">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-gray-900">{species.species}</p>
                            <p className="text-sm text-gray-500">
                              {species.count} sighting{species.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {species.conservation_status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConservationColor(species.conservation_status)}`}>
                              {species.conservation_status}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(species.lastSeen)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Activity Panel</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">👋</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Hello, {user?.name} (Admin)</p>
                      <p className="text-xs text-gray-500">Viewing: {getTimeRangeText()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No activity in {getTimeRangeText().toLowerCase()}</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center mt-0.5">
                            <span className="text-sm">{getActivityIcon(activity.type)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(activity.timestamp)}
                              {activity.user && ` • by ${activity.user}`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">System Overview</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-semibold">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified Sightings</span>
                        <span className="font-semibold text-green-600">{stats.verifiedReports}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Report Types</span>
                        <span className="font-semibold">{Object.keys(stats.reportsByType).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link href="/admin/reports" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <span>📋</span>
                        All Reports ({stats.totalReports})
                      </Link>
                      <Link href="/admin/reports?status=pending" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <span>⏰</span>
                        Pending Reviews ({stats.pendingReview})
                      </Link>
                      <Link href="/admin/reports?urgency=critical" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <span>🚨</span>
                        Critical Reports ({stats.criticalReports})
                      </Link>
                      <Link href="/admin/sightings" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <span>🐾</span>
                        All Sightings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}