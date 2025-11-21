'use client';

import { useState, useEffect } from 'react';
import { Database, Animal } from '../../database/database';
import { User } from '../../types/User';

export default function UserRecords() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get all users - cast to our User type to ensure compatibility
        const allUsers = Database.getUsers().map(user => ({
          ...user,
          // Add missing required properties from User type
          password: '',  // Empty string as we don't want to expose passwords
          role: user.role as 'admin' | 'user',
          createdAt: user.createdAt || new Date()
        } as User));
        
        setUsers(allUsers);
        
        // Get reports for all users
        const userReports: Record<string, any[]> = {};
        
        // Process users one by one to handle async calls
        for (const user of allUsers) {
          try {
            // getAnimals returns a Promise so we need to await it
            const animals = await Database.getAnimals(user.id);
            userReports[user.id] = animals;
          } catch (err) {
            console.error(`Error fetching animals for user ${user.id}:`, err);
            userReports[user.id] = [];
          }
        }
        
        setReports(userReports);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  // Handle selecting a user to view their reports
  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading user records...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Animal Detection Records</h1>
      
      {/* Search box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Users list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found matching your search.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <div key={user.id} className="p-0">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {reports[user.id]?.length || 0} Reports
                  </div>
                </div>
                
                {/* Expanded view with user's reports */}
                {selectedUser === user.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    {reports[user.id]?.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">No detection records for this user.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Animal Type</th>
                              <th className="px-4 py-2 text-left">Endangered</th>
                              <th className="px-4 py-2 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports[user.id]?.map((report, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="px-4 py-2">{new Date(report.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 capitalize">{report.animalType}</td>
                                <td className="px-4 py-2">
                                  {report.isEndangered ? (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2">{report.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => {
                          // Open printable version in new window
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Detection Records for ${user.name}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    table { width: 100%; border-collapse: collapse; }
                                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                    th { background-color: #f2f2f2; }
                                    h1, h2 { margin-bottom: 10px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Animal Detection Records</h1>
                                  <h2>User: ${user.name} (${user.email})</h2>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Date</th>
                                        <th>Animal Type</th>
                                        <th>Endangered</th>
                                        <th>Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${reports[user.id]?.map(report => `
                                        <tr>
                                          <td>${new Date(report.date).toLocaleDateString()}</td>
                                          <td style="text-transform: capitalize">${report.animalType}</td>
                                          <td>${report.isEndangered ? 'Yes' : 'No'}</td>
                                          <td>${report.notes}</td>
                                        </tr>
                                      `).join('') || '<tr><td colspan="4">No records found</td></tr>'}
                                    </tbody>
                                  </table>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }}
                      >
                        Print Records
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 