'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Verification from '../components/Verification';
import { useUser } from '../context/UserContext';

export default function VerificationPage() {
    const { isAuthenticated, user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router, user]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="py-6">
                <Verification />
            </div>
        );
    }

    return null;
}
