'use client';

import React from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
      {description && (
        <p className="mt-2 text-md text-gray-600 max-w-3xl">{description}</p>
      )}
      <div className="mt-4 h-1 w-24 bg-indigo-600 rounded"></div>
    </div>
  );
} 