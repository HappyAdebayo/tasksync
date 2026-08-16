'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Folder,
  Kanban,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react';
import { useWorkspaces } from '@/lib/workspaces';
import { getStoredUser, clearAuthToken } from '@/lib/api';
import { useSocket } from '@/lib/socket';

interface SidebarProps {
  /** Mobile: whether the sidebar drawer is open */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const workspaces = useWorkspaces();
  const { isConnected } = useSocket();

  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Close mobile sidebar when navigating
  useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    clearAuthToken();
    router.replace('/login');
  };

  const userName = user?.name || 'Jordan Diaz';
  const userEmail = user?.email || 'user@tasksync.io';
  const userInitials =
    userName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JD';

  const isDashboardActive = pathname === '/dashboard';
  const isWorkspacesActive =
    pathname.startsWith('/dashboard/workspaces') || pathname.startsWith('/dashboard/boards');

  const sidebarContent = (
    <aside className="flex h-full w-60 flex-col border-r border-[#E3E5EC] bg-white select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#E3E5EC] px-5 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#4C5FD5] to-[#3B4CB8] shadow-xs text-white">
            <Kanban className="h-4 w-4" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white transition-colors duration-300 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              title={isConnected ? 'Live WebSocket connected' : 'Connecting...'}
            />
          </span>
          <span className="font-[family-name:var(--font-display)] text-[17px] font-bold tracking-tight text-[#171A21]">
            TaskSync
          </span>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          aria-label="Close menu"
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl text-[#8E95A5] hover:bg-[#F6F7FB] hover:text-[#171A21] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all ${
            isDashboardActive
              ? 'bg-[#EEF0FD] text-[#4C5FD5] font-semibold'
              : 'text-[#6B7280] hover:bg-[#F6F7FB] hover:text-[#171A21]'
          }`}
        >
          <Home className={`h-4 w-4 flex-shrink-0 ${isDashboardActive ? 'text-[#4C5FD5]' : 'text-[#8E95A5]'}`} />
          Dashboard
        </Link>

        <Link
          href="/dashboard/workspaces"
          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all ${
            isWorkspacesActive
              ? 'bg-[#EEF0FD] text-[#4C5FD5] font-semibold'
              : 'text-[#6B7280] hover:bg-[#F6F7FB] hover:text-[#171A21]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Folder className={`h-4 w-4 flex-shrink-0 ${isWorkspacesActive ? 'text-[#4C5FD5]' : 'text-[#8E95A5]'}`} />
            Workspaces
          </div>
          {workspaces.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold flex-shrink-0 ${
                isWorkspacesActive ? 'bg-[#4C5FD5] text-white' : 'bg-[#F0F2F7] text-[#6B7280]'
              }`}
            >
              {workspaces.length}
            </span>
          )}
        </Link>
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-[#E3E5EC] p-3 bg-[#FAFAFC] flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-transparent p-2 text-left hover:border-[#E3E5EC] hover:bg-white transition-all"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C5FD5] to-[#7B8AF0] text-[12px] font-semibold text-white shadow-xs">
                {userInitials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#171A21]">{userName}</p>
                <p className="truncate text-[11px] text-[#8E95A5]">{userEmail}</p>
              </div>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-[#8E95A5] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-[#E3E5EC] bg-white p-1.5 shadow-[0_16px_36px_rgba(23,26,33,0.12)] animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-3 py-2 border-b border-[#F0F2F7]">
                <p className="text-[12px] font-semibold text-[#171A21]">{userName}</p>
                <p className="text-[10.5px] text-[#8E95A5] truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] font-medium text-[#C4453D] hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always visible fixed sidebar ── */}
      <div className="hidden lg:flex h-screen w-60 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* ── Mobile: slide-in drawer with backdrop ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-full w-60 transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
