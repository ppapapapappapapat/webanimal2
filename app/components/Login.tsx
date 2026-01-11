'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

// Smart API URL detection function (same as Register.tsx and Verification.tsx)
const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    return 'http://localhost:3001';
  }
  
  return 'http://10.82.64.38:3001';
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpData, setOtpData] = useState<{ username: string; emailMasked: string } | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const router = useRouter();
  const { login } = useUser();

  // Set API URL on component mount
  useEffect(() => {
    const url = getApiUrl();
    setApiUrl(url);
    console.log('🌐 Login using API URL:', url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        throw new Error('Please enter both username and password');
      }

      if (!apiUrl) {
        throw new Error('Connection not established. Please try again.');
      }

      // Use dynamic API URL
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Login response:', result);

        if (result.requires_otp) {
          // OTP required - show OTP verification screen
          setOtpData({
            username: username,
            emailMasked: result.email_masked || 'your email'
          });
          setShowOtp(true);
        } else {
          // Normal login successful
          const userData = {
            id: result.user.id.toString(),
            name: result.user.username,
            email: result.user.email,
            role: result.user.role as 'user' | 'admin',
            createdAt: new Date(result.user.created_at),
            updatedAt: new Date()
          };

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(userData));

          // Redirect to home
          router.push('/');
        }
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Invalid username or password');
        } catch {
          throw new Error('Invalid username or password');
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string): Promise<boolean> => {
    if (!otpData || !apiUrl) return false;

    try {
      const response = await fetch(`${apiUrl}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: otpData.username,
          otp: otp
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          const userData = {
            id: result.user.id.toString(),
            name: result.user.username,
            email: result.user.email,
            role: result.user.role as 'user' | 'admin',
            createdAt: new Date(result.user.created_at),
            updatedAt: new Date()
          };

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(userData));

          // Refresh the page to update context
          window.location.href = '/';
          return true;
        } else {
          setError(result.error || 'Invalid verification code');
          return false;
        }
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Verification failed');

          // Handle locked account
          if (errorData.locked) {
            setError('Too many failed attempts. Please request a new code.');
          } else if (errorData.attempts_left) {
            setError(`Invalid code. ${errorData.attempts_left} attempts remaining.`);
          }
        } catch {
          setError('Verification failed. Please try again.');
        }
        return false;
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      return false;
    }
  };

  const handleOtpResend = async (): Promise<boolean> => {
    if (!otpData || !apiUrl) return false;

    try {
      const response = await fetch(`${apiUrl}/api/otp/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: otpData.username
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update masked email if provided
          if (result.email_masked && otpData) {
            setOtpData({
              ...otpData,
              emailMasked: result.email_masked
            });
          }
          return true;
        } else {
          setError(result.error || 'Failed to resend code');
          return false;
        }
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Failed to resend code');
        } catch {
          setError('Failed to resend code. Please try again.');
        }
        return false;
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      return false;
    }
  };

  const handleBackToLogin = () => {
    setShowOtp(false);
    setOtpData(null);
    setError('');
  };

  // Show normal login form
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg animate-slide-in-bottom">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">AnimalCare+</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
          <p className="mt-1 text-xs text-gray-400">
            {apiUrl ? `Connected to: ${apiUrl.replace('http://', '')}` : 'Connecting...'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
            {error.includes('Failed to fetch') && (
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
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-green-600 hover:text-green-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !apiUrl}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register
            </a>
          </p>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Secure login with optional two-factor authentication
          </p>
        </div>
      </div>
    </div>
  );
}