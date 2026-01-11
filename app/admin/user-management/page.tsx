'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import AdminLayout from '../../components/admin/AdminLayout';

//const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.77:3001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.82.64.38:3001";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersToday: number;
}

export default function UserManagement() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users from backend...');
      
      const response = await fetch(`${API_URL}/api/admin/users`);
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users data received:', data);
        
        // Transform the data to match our interface
        const transformedUsers: User[] = (data.users || data || []).map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          created_at: user.created_at,
          is_active: user.is_active !== undefined ? Boolean(user.is_active) : true
        }));
        
        setUsers(transformedUsers);
        calculateStats(transformedUsers);
      } else {
        console.error('❌ Failed to fetch users, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage({ 
          type: 'error', 
          text: `Failed to load users: ${response.status}. Please check if the backend is running.` 
        });
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error loading users. Please check if the backend is running.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats({
      totalUsers: userList.length,
      activeUsers: userList.filter(u => u.is_active).length,
      adminUsers: userList.filter(u => u.role === 'admin').length,
      newUsersToday: userList.filter(u => {
        const userDate = new Date(u.created_at).toISOString().split('T')[0];
        return userDate === today;
      }).length
    });
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter - now using proper boolean is_active field
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: '' // Don't pre-fill password for security
    });
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    setFormData({
      username: '',
      email: '',
      role: 'user',
      password: ''
    });
    setShowCreateModal(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingUser) return;

  try {
    setUpdating(true);
    console.log('🔄 Updating user:', editingUser.id);
    
    // Prepare update data - include is_active to maintain current status
    const updateData: any = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      is_active: editingUser.is_active // Include current active status
    };
    
    // Only include password if provided and not empty
    if (formData.password && formData.password.trim() !== '') {
      updateData.password = formData.password;
    }

    console.log('📤 Sending update data:', updateData);
    console.log('🔗 Full API URL:', `${API_URL}/api/admin/users/${editingUser.id}`);

    // Test the connection with a health check instead of GET to user endpoint
    console.log('🧪 Testing backend connection...');
    const healthCheck = await fetch(`${API_URL}/health`);
    console.log('🔍 Health check status:', healthCheck.status);
    
    if (healthCheck.ok) {
      console.log('✅ Backend is running and accessible');
    }

    // Try PUT method first (more widely supported)
    console.log('🔄 Trying PUT method...');
    const putResponse = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    console.log('📡 PUT Response status:', putResponse.status);
    console.log('📡 PUT Response ok:', putResponse.ok);

    if (putResponse.ok) {
      const result = await putResponse.json();
      console.log('✅ User updated successfully with PUT:', result);
      
      setMessage({ type: 'success', text: 'User updated successfully' });
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', role: 'user', password: '' });
      fetchUsers(); // Refresh the list
      return;
    }

    // If PUT failed, try PATCH
    console.log('🔄 PUT failed, trying PATCH method...');
    const patchResponse = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    console.log('📡 PATCH Response status:', patchResponse.status);
    console.log('📡 PATCH Response ok:', patchResponse.ok);

    if (patchResponse.ok) {
      const result = await patchResponse.json();
      console.log('✅ User updated successfully with PATCH:', result);
      
      setMessage({ type: 'success', text: 'User updated successfully' });
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', role: 'user', password: '' });
      fetchUsers();
      return;
    }

    // If both methods failed, show detailed error
    let errorMessage = `Server error: ${putResponse.status} - ${putResponse.statusText}`;
    
    try {
      const errorText = await putResponse.text();
      console.error('❌ Server error response:', errorText);
      
      if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (textError) {
      console.error('❌ Could not read error response:', textError);
    }
    
    setMessage({ type: 'error', text: errorMessage });

  } catch (error) {
    console.error('❌ Network error updating user:', error);
    setMessage({ 
      type: 'error', 
      text: `Network error: ${error instanceof Error ? error.message : 'Cannot connect to server'}. Please check if the backend is running.` 
    });
  } finally {
    setUpdating(false);
  }
};

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password) {
      setMessage({ type: 'error', text: 'Password is required for new users' });
      return;
    }

    try {
      setUpdating(true);
      console.log('🔄 Creating new user');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          is_active: true
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully' });
        setShowCreateModal(false);
        setFormData({ username: '', email: '', role: 'user', password: '' });
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create user' }));
        setMessage({ type: 'error', text: errorData.error || 'Failed to create user' });
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      setMessage({ type: 'error', text: 'Network error creating user. Please check if the backend is running.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their sightings and reports. This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      console.log('🔄 Deleting user:', userId);
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully' });
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete user' }));
        setMessage({ type: 'error', text: errorData.error || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      setMessage({ type: 'error', text: 'Network error deleting user. Please check if the backend is running.' });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Properly compare user IDs
  const isCurrentUser = (userId: number): boolean => {
    if (!currentUser?.id) return false;
    return userId === Number(currentUser.id);
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'GET',
      });
      console.log('🔗 Backend connection test result:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: `${API_URL}/api/admin/users`
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions</p>
        </div>

        {/* Debug Button - Remove after fixing */}
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800 mb-2">Debug Information:</p>
          <p className="text-yellow-800 text-sm">API_URL: {API_URL}</p>
          <p className="text-yellow-800 text-sm">Total Users: {users.length}</p>
          <button
            onClick={testBackendConnection}
            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Test Backend Connection
          </button>
          <button
            onClick={fetchUsers}
            className="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Users
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.adminUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Today</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.newUsersToday}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">🆕</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Create User Button */}
            <button
              onClick={handleCreateUser}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Create User
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-lg font-bold hover:opacity-70 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {users.length === 0 ? 'No users found' : 'No users match your filters'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.is_active)}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          {!isCurrentUser(user.id) && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <form onSubmit={handleSubmitEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only enter a password if you want to change it
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setFormData({ username: '', email: '', role: 'user', password: '' });
                    }}
                    disabled={updating}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Create New User</h3>
              <form onSubmit={handleSubmitCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Creating...' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ username: '', email: '', role: 'user', password: '' });
                    }}
                    disabled={updating}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}