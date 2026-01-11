'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../context/UserContext';

export default function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendOtp, error: contextError, clearError, isLoading: contextLoading } = useUser();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(contextLoading);
  }, [contextLoading]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    if (pastedNumbers.length === 6) {
      setOtp(pastedNumbers);
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setSuccessMessage('');

    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setLocalError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setLocalError('Email not found. Please try registering again.');
      return;
    }

    try {
      const success = await verifyEmail(email, otpCode);
      
      if (success) {
        setSuccessMessage('Email verified successfully! Redirecting to home...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setLocalError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) {
      setLocalError(`Please wait ${resendCountdown} seconds before requesting a new code`);
      return;
    }

    if (!email) {
      setLocalError('Email not found');
      return;
    }

    try {
      const success = await resendOtp(email);
      
      if (success) {
        setSuccessMessage('New verification code sent to your email');
        setResendCountdown(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  const displayError = localError || contextError;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg animate-slide-in-bottom">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">AnimalCare+</h1>
          <p className="mt-2 text-gray-600">Verify Your Email</p>
          <p className="mt-1 text-sm text-gray-500">
            Enter the 6-digit code sent to
          </p>
          <p className="font-medium text-blue-600">{email || 'your email'}</p>
        </div>
        
        {displayError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {displayError}
          </div>
        )}
        
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {successMessage}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="space-y-4">
            <div>
              <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                6-Digit Verification Code
              </label>
              <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify Email'}
              </button>
            </div>
          </div>
        </form>
        
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0 || isLoading}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
            </button>
          </p>
          
          <p className="text-sm text-gray-600">
            Need to change email?{' '}
            <a href="/register" className="font-medium text-gray-600 hover:text-gray-800">
              Go back
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}