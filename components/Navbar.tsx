'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Folder,
  Building2,
  User,
  Menu,
  Kanban,
  Mail,
  CheckCircle2,
  ExternalLink,
  X,
  ListTodo,
} from 'lucide-react';
import { useNotifications, respondToInvite } from '@/lib/invites';
import { getAuthToken } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchResult =
  | { type: 'workspace'; id: string; name: string; workspaceId: string }
  | { type: 'board'; id: string; name: string; workspaceId: string }
  | { type: 'task'; id: string; name: string; boardId: string; workspaceId: string; boardListId: string }
  | { type: 'person'; id: string; name: string; email: string; workspaceId: string };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNavHref(result: SearchResult): string {
  switch (result.type) {
    case 'workspace':
      return `/dashboard/workspaces?workspace=${result.workspaceId}`;
    case 'board':
      return `/dashboard/boards/${result.id}`;
    case 'task':
      return `/dashboard/boards/${result.boardId}`;
    case 'person':
      return result.workspaceId
        ? `/dashboard/workspaces?workspace=${result.workspaceId}`
        : '/dashboard/workspaces';
  }
}

function typeLabel(type: SearchResult['type']) {
  switch (type) {
    case 'workspace': return 'Workspace';
    case 'board': return 'Board';
    case 'task': return 'Task';
    case 'person': return 'Member';
  }
}

function TypeIcon({ type }: { type: SearchResult['type'] }) {
  switch (type) {
    case 'workspace': return <Building2 className="h-3.5 w-3.5" />;
    case 'board': return <Kanban className="h-3.5 w-3.5" />;
    case 'task': return <ListTodo className="h-3.5 w-3.5" />;
    case 'person': return <User className="h-3.5 w-3.5" />;
  }
}

const TYPE_COLOR: Record<SearchResult['type'], string> = {
  workspace: 'bg-purple-50 text-purple-600',
  board: 'bg-[#EEF0FD] text-[#4C5FD5]',
  task: 'bg-emerald-50 text-emerald-600',
  person: 'bg-amber-50 text-amber-600',
};

function HighlightText({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1 || !query) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-[#101828] rounded-sm not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Notification dropdown helpers ────────────────────────────────────────────

function NotifDropdown({
  notifications,
  onClose,
}: {
  notifications: ReturnType<typeof useNotifications>;
  onClose: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+8px)] w-[320px] rounded-2xl border border-[#EAECF0] bg-white shadow-[0_16px_36px_rgba(23,26,33,0.12)] z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#4C5FD5]" />
          <span className="text-[13.5px] font-semibold text-[#101828]">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#C4453D] px-1.5 py-0.5 text-[10.5px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="flex items-center gap-1 text-[11.5px] font-medium text-[#4C5FD5] hover:underline"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-[#17C3B2] stroke-[1.5]" />
          <p className="mt-2 text-[13px] font-medium text-[#101828]">All caught up!</p>
          <p className="mt-0.5 text-[11.5px] text-[#667085]">No notifications at the moment.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#EAECF0] max-h-[320px] overflow-y-auto">
          {notifications.slice(0, 5).map((notif) => (
            <div
              key={notif.id}
              className={`flex flex-col gap-1 px-4 py-3 ${!notif.isRead ? 'bg-[#F8F9FD]' : ''}`}
            >
              <p className="text-[12.5px] font-semibold text-[#101828]">{notif.title}</p>
              <p className="text-[12px] text-[#667085]">{notif.message}</p>
              {notif.invitationToken && notif.invitationStatus === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => respondToInvite(notif.id, notif.invitationToken!, 'accept')}
                    className="rounded-md bg-[#4C5FD5] px-2.5 py-1 text-[11.5px] font-medium text-white hover:bg-[#3E4EC0]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToInvite(notif.id, notif.invitationToken!, 'decline')}
                    className="rounded-md border border-[#EAECF0] px-2.5 py-1 text-[11.5px] font-medium text-[#667085] hover:text-[#C4453D]"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar Component ─────────────────────────────────────────────────────

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setResultsOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced backend search scoped to user's workspaces
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const merged: SearchResult[] = [];

      (data.boards || []).forEach((b: any) =>
        merged.push({ type: 'board', id: b.id, name: b.name, workspaceId: b.workspaceId })
      );
      (data.tasks || []).forEach((t: any) =>
        merged.push({
          type: 'task',
          id: t.id,
          name: t.name,
          boardId: t.boardId,
          boardListId: t.boardListId,
          workspaceId: t.workspaceId,
        })
      );
      (data.people || []).forEach((p: any) =>
        merged.push({ type: 'person', id: p.id, name: p.name, email: p.email, workspaceId: p.workspaceId })
      );

      setResults(merged);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setResultsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 280);
  };

  const handleResultClick = (result: SearchResult) => {
    setResultsOpen(false);
    setQuery('');
    router.push(getNavHref(result));
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setResultsOpen(false);
  };

  // Group results by type
  const grouped = useMemo(() => {
    const g: Partial<Record<SearchResult['type'], SearchResult[]>> = {};
    for (const r of results) {
      (g[r.type] ??= []).push(r);
    }
    return g;
  }, [results]);

  const orderedTypes: SearchResult['type'][] = ['board', 'task', 'person', 'workspace'];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#EAECF0] bg-white/95 px-4 sm:px-6 backdrop-blur-md gap-3">

      {/* ── Hamburger (mobile only) ── */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#667085] hover:border-[#4C5FD5] hover:text-[#4C5FD5] transition-colors"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Search */}
      <div className="relative flex-1 min-w-0" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] px-3.5 py-2 transition-all focus-within:border-[#4C5FD5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4C5FD5]/10">
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#98A2B3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query && setResultsOpen(true)}
            onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
            placeholder="Search boards, tasks, members…"
            aria-label="Search"
            autoComplete="off"
            className="w-full bg-transparent text-[13px] text-[#101828] placeholder:text-[#98A2B3] outline-none"
          />
          {isSearching && (
            <div className="h-3.5 w-3.5 flex-shrink-0 animate-spin rounded-full border-2 border-[#4C5FD5] border-t-transparent" />
          )}
          {query && !isSearching && (
            <button onClick={clearSearch} className="text-[#98A2B3] hover:text-[#101828] transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {resultsOpen && query && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+6px)] max-h-[420px] overflow-y-auto rounded-2xl border border-[#EAECF0] bg-white p-2 shadow-[0_16px_40px_rgba(23,26,33,0.12)] z-50"
          >
            {results.length === 0 && !isSearching ? (
              <div className="px-4 py-8 text-center">
                <Search className="mx-auto h-8 w-8 text-[#D0D5DD]" />
                <p className="mt-2 text-[13px] font-medium text-[#101828]">No results found</p>
                <p className="mt-0.5 text-[11.5px] text-[#667085]">
                  Try searching within your workspaces
                </p>
              </div>
            ) : (
              orderedTypes
                .filter((type) => grouped[type] && grouped[type]!.length > 0)
                .map((type) => (
                  <div key={type} className="mb-2 last:mb-0">
                    <p className="mb-1 px-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#98A2B3]">
                      {typeLabel(type)}s
                    </p>
                    {grouped[type]!.map((result) => (
                      <button
                        key={result.id}
                        role="option"
                        aria-selected={false}
                        onClick={() => handleResultClick(result)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#F9FAFB] group"
                      >
                        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${TYPE_COLOR[type]}`}>
                          <TypeIcon type={type} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-[#101828]">
                            <HighlightText text={result.name} query={query} />
                          </p>
                          {result.type === 'person' && (
                            <p className="truncate text-[11.5px] text-[#98A2B3]">
                              <HighlightText text={result.email} query={query} />
                            </p>
                          )}
                          {result.type === 'task' && (
                            <p className="truncate text-[11.5px] text-[#98A2B3]">
                              Click to open board →
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] text-[#98A2B3] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          Go →
                        </span>
                      </button>
                    ))}
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Right: Notification Bell */}
      <div className="relative flex-shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#667085] transition-colors hover:border-[#4C5FD5] hover:text-[#4C5FD5]"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C4453D] px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <NotifDropdown
            notifications={notifications}
            onClose={() => setNotifOpen(false)}
          />
        )}
      </div>
    </header>
  );
}