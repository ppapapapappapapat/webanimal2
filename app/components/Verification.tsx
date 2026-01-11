'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// Smart API URL detection function (same as Register.tsx)
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

export default function Verification() {
    const searchParams = useSearchParams();
    const defaultEmail = searchParams.get('email') || '';
    const [email, setEmail] = useState(defaultEmail);
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiUrl, setApiUrl] = useState<string>(''); // Store API URL
    const router = useRouter();

    // Set API URL on component mount
    useEffect(() => {
        const url = getApiUrl();
        setApiUrl(url);
        console.log('🌐 Verification using API URL:', url);
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!email || !token) {
            setMessage('Please enter both email and token.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔐 Verifying email with API:', apiUrl);
            
            // Use the dynamic API URL instead of hardcoded localhost
            const res = await fetch(`${apiUrl}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('✅ Email verified successfully!');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setMessage(`❌ Verification failed: ${data.error}`);
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            setMessage('❌ Network error. Make sure the Flask server is running.');
            console.log('🔗 Connection details:');
            console.log('- API URL:', apiUrl);
            console.log('- Error:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md space-y-6">
                <h1 className="text-2xl font-bold text-green-600 text-center">Email Verification</h1>
                <p className="text-center text-gray-600">Enter your email and 6-character token to verify your account.</p>
                
                {/* Show API connection info for debugging */}
                <div className="text-center text-xs text-gray-400">
                    {apiUrl ? `Connected to: ${apiUrl.replace('http://', '')}` : 'Connecting...'}
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message}
                        {message.includes('Network error') && apiUrl && (
                            <div className="mt-2 text-xs">
                                <p>Check if:</p>
                                <ul className="list-disc pl-4">
                                    <li>Flask is running on {apiUrl}</li>
                                    <li>Firewall allows connections</li>
                                    <li>Devices are on same WiFi</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isLoading}
                    />
                    <input
                        type="text"
                        placeholder="6-character token"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-xl tracking-widest"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !apiUrl}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500 mt-4 space-y-2">
                    <p>
                        Already verified? <a href="/login" className="text-blue-600 hover:text-blue-500">Sign in</a>
                    </p>
                    <p className="text-xs text-gray-400">
                        Token should arrive within a few minutes. Check spam folder.
                    </p>
                </div>
            </div>
        </div>
    );
}