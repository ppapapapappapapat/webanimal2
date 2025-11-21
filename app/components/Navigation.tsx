'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../context/UserContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  const isAdminActive = () => {
    return pathname.startsWith('/admin');
  };

  const isUserActive = () => {
    return pathname.startsWith('/user');
  };

  const handleLogout = () => {
    logout();
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group" aria-label="PawthCare Home">
              <svg className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pawGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34d399" />
                    <stop offset="1" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <ellipse cx="32" cy="48" rx="14" ry="10" fill="url(#pawGradient)" />
                <circle cx="16" cy="32" r="6" fill="url(#pawGradient)" />
                <circle cx="48" cy="32" r="6" fill="url(#pawGradient)" />
                <circle cx="24" cy="20" r="5" fill="url(#pawGradient)" />
                <circle cx="40" cy="20" r="5" fill="url(#pawGradient)" />
              </svg>
              <span className="ml-3 text-2xl font-extrabold text-gray-900 group-hover:text-green-700 transition-colors duration-200">PawthCare</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-6">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              
              {isAuthenticated && (
                <>
                  {/* Show these links only for regular users, not admins */}
                  {user?.role !== 'admin' && (
                    <>
                      <Link 
                        href="/animal-detection"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          isActive('/animal-detection') 
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        Wildlife Detection
                      </Link>
                      <Link 
                        href="/endangered-species"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          isActive('/endangered-species') 
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        Endangered Species
                      </Link>
                      
                      {/* User dropdown menu for regular users */}
                      <div className="relative group">
                        <Link 
                          href="/user/reports"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                            isUserActive()
                              ? 'border-blue-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                        >
                          My Account
                          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </Link>
                        
                        {/* User dropdown menu */}
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-1">
                            <Link 
                              href="/user/reports"
                              className={`block px-4 py-2 text-sm ${
                                isActive('/user/reports') 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              📋 My Reports History
                            </Link>
                            <Link 
                              href="/user/notifications"
                              className={`block px-4 py-2 text-sm ${
                                isActive('/user/notifications') 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              🔔 Notifications
                            </Link>
                            <Link 
                              href="/profile"
                              className={`block px-4 py-2 text-sm ${
                                isActive('/profile') 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              👤 My Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Admin links - Enhanced with dropdown */}
                  {user?.role === 'admin' && (
                    <div className="relative group">
                      <Link 
                        href="/admin/dashboard"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          isAdminActive()
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        Admin Panel
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Link>
                      
                      {/* Admin dropdown menu */}
                      <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          <Link 
                            href="/admin/dashboard"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/admin/dashboard') 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            📊 Dashboard Overview
                          </Link>
                          <Link 
                            href="/admin/user-management"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/admin/user-management') 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            👥 User Management
                          </Link>
                          <Link 
                            href="/admin/sightings"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/admin/sightings') 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            🐾 All Sightings
                          </Link>
                          <Link 
                            href="/admin/analytics"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/admin/analytics') 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            📈 Detection Analytics
                          </Link>
                          <Link 
                            href="/admin/reports"
                            className={`block px-4 py-2 text-sm ${
                              isActive('/admin/reports') 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            📋 User Reports
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {isAuthenticated ? (
              <div className="ml-4 flex items-center">
                <Link 
                  href="/profile"
                  className="text-sm text-gray-600 mr-2 hover:text-blue-600 transition-colors"
                >
                  Hello, {user?.name}
                  {user?.role === 'admin' && <span className="ml-1 text-xs text-blue-600">(Admin)</span>}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm py-1 px-3 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-4 flex space-x-2">
                <Link 
                  href="/login"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                    isActive('/login') ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    isActive('/register') ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, toggle classes based on menu state */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              {/* Show these links only for regular users, not admins */}
              {user?.role !== 'admin' && (
                <>
                  <Link 
                    href="/animal-detection"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/animal-detection') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wildlife Detection
                  </Link>
                  <Link 
                    href="/endangered-species"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/endangered-species') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Endangered Species
                  </Link>
                  
                  {/* User menu for mobile */}
                  <div className="pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-l-4 border-transparent">
                    My Account
                  </div>
                  <Link 
                    href="/user/reports"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/user/reports') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📋 My Reports History
                  </Link>
                  <Link 
                    href="/user/notifications"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/user/notifications') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🔔 Notifications
                  </Link>
                  <Link 
                    href="/profile"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/profile') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    👤 My Profile
                  </Link>
                </>
              )}
              
              {/* Admin links for mobile */}
              {user?.role === 'admin' && (
                <>
                  <div className="pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-l-4 border-transparent">
                    Admin Panel
                  </div>
                  <Link 
                    href="/admin/dashboard"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin/dashboard') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link 
                    href="/admin/user-management"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin/user-management') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    👥 User Management
                  </Link>
                  <Link 
                    href="/admin/sightings"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin/sightings') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🐾 All Sightings
                  </Link>
                  <Link 
                    href="/admin/analytics"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin/analytics') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📈 Analytics
                  </Link>
                  <Link 
                    href="/admin/reports"
                    className={`block pl-6 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin/reports') 
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📋 User Reports
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}