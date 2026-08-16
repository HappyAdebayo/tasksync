'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { getAuthToken } from '@/lib/api';
import { useTokenRefresh } from '@/lib/useTokenRefresh';
import { SocketProvider } from '@/lib/socket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  // Silently refresh the access token every 12 minutes
  useTokenRefresh();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#F6F7FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4C5FD5] border-t-transparent" />
          <p className="text-[13px] font-medium text-[#6B7280]">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-[#F6F7FB] text-[#171A21]">
        {/* Sidebar (desktop: always visible, mobile: slide-in drawer) */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
