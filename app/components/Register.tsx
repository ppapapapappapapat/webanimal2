'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

// Smart API URL detection function
const getApiUrl = (): string => {
  // Check if we're in a browser
  if (typeof window === 'undefined') {
    return 'http://localhost:3001'; // Default for server-side
  }
  
  // Check if we're on localhost (development on computer)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    return 'http://localhost:3001'; // Computer development
  }
  
  // For mobile/other devices, use your computer's IP
  return 'http://10.82.64.38:3001'; // Mobile access
};

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>(''); // Store API URL
  const router = useRouter();
  const { register, error: contextError, clearError, isLoading: contextLoading } = useUser();

  // Set API URL on component mount
  useEffect(() => {
    const url = getApiUrl();
    setApiUrl(url);
    console.log('🌐 Using API URL:', url);
  }, []);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setLocalError('');
    setEmailError('');
  }, [clearError]);

  // Update loading state based on context
  useEffect(() => {
    setIsLoading(contextLoading);
  }, [contextLoading]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to check if email already exists in database
  const checkEmailExists = async (emailToCheck: string): Promise<boolean> => {
    try {
      console.log('📧 Checking email:', emailToCheck);
      console.log('🌐 Using API URL:', apiUrl);
      
      if (!apiUrl) {
        console.log('⚠️ API URL not set yet, skipping email check');
        return false;
      }
      
      const response = await fetch(`${apiUrl}/check-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: emailToCheck })
      });

      console.log('📧 Response status:', response.status);
      
      if (!response.ok) {
        console.log('📧 Email check failed, returning false');
        return false;
      }

      const data = await response.json();
      console.log('📧 Response data:', data);
      return data.exists || false;
      
    } catch (error) {
      console.error('❌ Network error checking email:', error);
      // Show helpful error message
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🔗 Connection error - make sure Flask backend is running');
      }
      return false; // Don't block registration on error
    }
  };

  // Handle email field blur (when user leaves email field)
  const handleEmailBlur = async () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError('');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    } else {
      setEmailError('');
    }

    setIsCheckingEmail(true);
    try {
      console.log('🔄 Starting email check for:', trimmedEmail);
      const emailExists = await checkEmailExists(trimmedEmail);
      console.log('✅ Email check completed. Exists:', emailExists);
      
      if (emailExists) {
        setEmailError('This email is already registered. Please use a different email or try logging in.');
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error('❌ Error in handleEmailBlur:', error);
      setEmailError('');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Handle email change - clear email error when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (emailError && emailError.includes('already registered')) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setEmailError('');
    clearError();

    try {
      if (!name || !email || !password || !confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (!isValidEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }

      // Re-check email existence on submit
      setIsCheckingEmail(true);
      const emailExists = await checkEmailExists(email);
      setIsCheckingEmail(false);
      
      if (emailExists) {
        setEmailError('This email is already registered. Please use a different email or try logging in.');
        return;
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Register the user (make sure register function also uses correct API URL)
      const success = await register(name, email, password);

      if (success) {
        router.push(`/verification?email=${encodeURIComponent(email)}`);
      }

    } catch (err) {
      console.error('Registration validation error:', err);
      setLocalError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // Determine which error to display
  const displayError = localError || contextError;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg animate-slide-in-bottom">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">AnimalCare+</h1>
          <p className="mt-2 text-gray-600">Create a new account</p>
          <p className="mt-1 text-xs text-gray-400">
            {apiUrl ? `Connected to: ${apiUrl}` : 'Connecting...'}
          </p>
        </div>

        {/* Display general errors */}
        {displayError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {displayError}
            {contextError && contextError.includes('Failed to fetch') && (
              <div className="mt-2 text-xs">
                <p>Connection error. Please check:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Flask backend is running on port 3001</li>
                  <li>Your computer's IP: 192.168.100.77</li>
                  <li>Phone and computer are on same WiFi</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-3 py-2 border ${emailError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  disabled={isLoading || isCheckingEmail}
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent"></div>
                  </div>
                )}
              </div>
              
              {emailError && (
                <div className="mt-1 text-sm text-red-600 flex items-start">
                  <span className="mr-1">⚠️</span>
                  <span>{emailError}</span>
                </div>
              )}
              
              {!emailError && email && !emailError && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Email format is valid
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                At least 6 characters
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isCheckingEmail || !!emailError}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {typeof window !== 'undefined' && (
              <>Your device: {window.location.hostname}</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}