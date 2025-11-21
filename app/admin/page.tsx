'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconHome,
  IconUsers,
  IconPaw,
  IconChartBar,
  IconSettings,
  IconAlertTriangle,
  IconMenu2,
  IconX,
  IconLogout,
  IconEye,
  IconReport,
  IconActivity,
} from '@tabler/icons-react';
import { useUser } from '@/app/context/UserContext';

const navigation = [
  { name: 'Dashboard Overview', href: '/admin', icon: IconHome },
  { name: 'User Management', href: '/admin/users', icon: IconUsers },
  { name: 'All Sightings', href: '/admin/sightings', icon: IconEye },
  { name: 'Detection Analytics', href: '/admin/analytics', icon: IconChartBar },
  { name: 'User Reports', href: '/admin/reports', icon: IconReport },
  { name: 'Animal Management', href: '/admin/animals', icon: IconPaw },
  { name: 'Endangered Species', href: '/admin/endangered', icon: IconAlertTriangle },
  { name: 'Activity Logs', href: '/admin/activity', icon: IconActivity },
  { name: 'System Settings', href: '/admin/settings', icon: IconSettings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/profile');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering if not admin
  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <div
        className="fixed inset-0 flex z-40 lg:hidden"
        role="dialog"
        aria-modal="true"
        style={{ display: sidebarOpen ? 'flex' : 'none' }}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <IconX className="h-6 w-6 text-gray-800" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          {/* Admin Info */}
          <div className="mt-8 mb-4 px-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Hello, admin</p>
                <p className="text-xs text-gray-500">(Admin)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="px-4 mb-4">
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
            >
              <IconLogout size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          {/* Admin Info */}
          <div className="mt-8 mb-4 px-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Hello, admin</p>
                <p className="text-xs text-gray-500">(Admin)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="px-4 mb-4">
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
            >
              <IconLogout size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <IconMenu2 className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Hello, admin</span>
              <button
                onClick={logout}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <IconLogout size={18} />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}