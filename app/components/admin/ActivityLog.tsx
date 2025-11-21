'use client';

import { useState, useEffect } from 'react';
import type { ActivityLog } from '@/app/database/utils';
import { FiSearch } from 'react-icons/fi';

interface ActivityLogProps {
    initialLogs?: ActivityLog[];
}

interface ExtendedActivityLog extends ActivityLog {
    user_name?: string;
}

export default function ActivityLog({ initialLogs = [] }: ActivityLogProps) {
    const [logs, setLogs] = useState<ExtendedActivityLog[]>(initialLogs);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const logsPerPage = 10;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                action: filter !== 'all' ? filter : ''
            });

            const response = await fetch(`/api/activity-logs?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch activity logs');
            }

            const data = await response.json();
            setLogs(data.logs);
            setTotalLogs(data.total);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter, page]);

    const getActionStyle = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create': return 'bg-green-100 text-green-800';
            case 'update': return 'bg-blue-100 text-blue-800';
            case 'delete': return 'bg-red-100 text-red-800';
            case 'login': return 'bg-purple-100 text-purple-800';
            case 'detection': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const totalPages = Math.ceil(totalLogs / logsPerPage);

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Activity Log</h2>
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    >
                        All
                    </button>
                    {['login', 'create', 'update', 'delete', 'detection'].map((action) => (
                        <button
                            key={action}
                            onClick={() => setFilter(action)}
                            className={`px-4 py-2 rounded capitalize ${
                                filter === action ? 'bg-primary text-white' : 'bg-gray-100'
                            }`}
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg w-64"
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{log.user_name || 'Unknown User'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-sm rounded-full ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{log.target}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {typeof log.details === 'string' 
                                                    ? log.details 
                                                    : JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            No activity logs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 