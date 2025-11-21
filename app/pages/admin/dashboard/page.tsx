import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsDashboard from '../../../components/admin/AnalyticsDashboard';
import UserManagement from '../../../components/admin/UserManagement';
import AdminDetectionList from '../../../components/admin/AdminDetectionList';
import EndangeredSpeciesAdmin from '../../../components/admin/EndangeredSpeciesAdmin';
import ActivityLog from '../../../components/admin/ActivityLog';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-green-800">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <AnalyticsDashboard />
          </div>
          <div>
            <UserManagement />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <AdminDetectionList />
          </div>
          <div>
            <EndangeredSpeciesAdmin />
          </div>
        </div>
        <div className="mt-8">
          <ActivityLog />
        </div>
      </div>
    </AdminLayout>
  );
} 