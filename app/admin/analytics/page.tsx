import AdminLayout from '../../components/admin/AdminLayout';

export default function DetectionAnalytics() {
  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detection Analytics</h1>
              <p className="text-gray-600 mt-1">
                Analytics and insights from animal detections
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Generate Report
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">Analytics Coming Soon</p>
              <p className="text-gray-400 text-sm">
                This feature is currently under development
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}