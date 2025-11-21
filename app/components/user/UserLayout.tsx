// components/user/UserLayout.tsx
'use client';

import { ReactNode } from 'react';

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - No duplicate navigation */}
      <main>{children}</main>
    </div>
  );
}