'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Folder,
  Building2,
  User,
  Mail,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useNotifications, respondToInvite } from '@/lib/invites';
import { useBoards } from '@/lib/board-utils';
import { useWorkspaces } from '@/lib/workspaces';
import { buildSearchIndex, searchItems, type SearchItem } from '@/lib/search-data';
import { getStoredUser, clearAuthToken, searchApi } from '@/lib/api';
import { useDebounceValue } from '@/lib/useDebounce';

const TYPE_META: Record<SearchItem['type'], { label: string; icon: typeof Folder }> = {
  workspace: { label: 'Workspaces', icon: Building2 },
  board: { label: 'Boards', icon: Folder },
  person: { label: 'People', icon: User },
};

function HighlightedLabel({ label, query }: { label: string; query: string }) {
  const index = label.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{label}</>;
  return (
    <>
      {label.slice(0, index)}
      <span className="font-semibold text-[#171A21]">{label.slice(index, index + query.length)}</span>
      {label.slice(index + query.length)}
    </>
  );
}

export default function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [backendSearchItems, setBackendSearchItems] = useState<SearchItem[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const boards = useBoards();
  const workspaces = useWorkspaces();

  const debouncedQuery = useDebounceValue(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setBackendSearchItems([]);
      return;
    }

    let active = true;
    searchApi(debouncedQuery)
      .then((res) => {
        if (!active) return;
        const remoteItems: SearchItem[] = [];
        if (res.boards) {
          res.boards.forEach((b) =>
            remoteItems.push({ id: b.id, label: b.name, type: 'board' })
          );
        }
        if (res.tasks) {
          res.tasks.forEach((t) =>
            remoteItems.push({ id: t.id, label: t.name, type: 'board', meta: 'Task' })
          );
        }
        if (res.people) {
          res.people.forEach((p) =>
            remoteItems.push({ id: p.id, label: p.name, type: 'person', meta: p.email })
          );
        }
        setBackendSearchItems(remoteItems);
      })
      .catch(() => {
        // Fallback to local
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const index = useMemo(() => {
    const localIndex = buildSearchIndex(workspaces, boards);
    if (backendSearchItems.length === 0) return localIndex;
    const existingIds = new Set(localIndex.map((i) => i.id));
    const merged = [...localIndex];
    for (const item of backendSearchItems) {
      if (!existingIds.has(item.id)) {
        merged.push(item);
      }
    }
    return merged;
  }, [workspaces, boards, backendSearchItems]);

  const results = useMemo(() => searchItems(index, query), [index, query]);
  const grouped = useMemo(() => {
    const groups: Partial<Record<SearchItem['type'], SearchItem[]>> = {};
    for (const item of results) {
      (groups[item.type] ??= []).push(item);
    }
    return groups;
  }, [results]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setResultsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E3E5EC] bg-white/95 px-6 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-xl border border-[#E3E5EC] bg-[#F6F7FB] px-3.5 py-1.5 transition-all focus-within:border-[#4C5FD5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4C5FD5]/10">
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#8E95A5]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResultsOpen(true);
            }}
            onFocus={() => query && setResultsOpen(true)}
            placeholder="Search tasks, workspaces, members…"
            aria-label="Search"
            role="combobox"
            aria-expanded={resultsOpen}
            autoComplete="off"
            className="w-full bg-transparent text-[13px] text-[#171A21] placeholder:text-[#8E95A5] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[11px] text-[#8E95A5] hover:text-[#171A21]"
            >
              Clear
            </button>
          )}
        </div>

        {resultsOpen && query && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-[360px] overflow-y-auto rounded-xl border border-[#E3E5EC] bg-white p-1.5 shadow-[0_12px_32px_rgba(23,26,33,0.12)] z-50"
          >
            {results.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[13px] text-[#6B7280]">
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              (Object.keys(grouped) as SearchItem['type'][]).map((type) => {
                const { label, icon: Icon } = TYPE_META[type];
                return (
                  <div key={type} className="mb-1.5 last:mb-0">
                    <p className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#8E95A5]">
                      {label}
                    </p>
                    {grouped[type]!.map((item) => (
                      <button
                        key={item.id}
                        role="option"
                        aria-selected={false}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#F6F7FB] transition-colors"
                        onClick={() => {
                          setQuery(item.label);
                          setResultsOpen(false);
                        }}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF0FD] text-[#4C5FD5]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 truncate text-[13px] text-[#171A21]">
                          <HighlightedLabel label={item.label} query={query} />
                        </span>
                        {item.meta && (
                          <span className="ml-auto flex-shrink-0 truncate text-[11.5px] text-[#8E95A5]">
                            {item.meta}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right icons: Notification Bell */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E3E5EC] bg-white text-[#6B7280] transition-colors hover:border-[#4C5FD5] hover:text-[#4C5FD5]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C4453D] px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] w-[320px] rounded-2xl border border-[#E3E5EC] bg-white shadow-[0_16px_36px_rgba(23,26,33,0.12)] z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E3E5EC] bg-[#FAFAFC] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#4C5FD5]" />
                  <span className="text-[13.5px] font-semibold text-[#171A21]">Notifications</span>
                </div>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center gap-1 text-[11.5px] font-medium text-[#4C5FD5] hover:underline"
                >
                  View all <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-[#17C3B2] stroke-[1.5]" />
                  <p className="mt-2 text-[13px] font-medium text-[#171A21]">All caught up!</p>
                  <p className="mt-0.5 text-[11.5px] text-[#6B7280]">No notifications at the moment.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#E3E5EC] max-h-[320px] overflow-y-auto">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex flex-col gap-1 px-4 py-3 ${
                        !notif.isRead ? 'bg-[#F8F9FD]' : ''
                      }`}
                    >
                      <p className="text-[12.5px] font-semibold text-[#171A21]">{notif.title}</p>
                      <p className="text-[12px] text-[#6B7280]">{notif.message}</p>
                      {notif.invitationToken && notif.invitationStatus === 'pending' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => respondToInvite(notif.id, notif.invitationToken!, 'accept')}
                            className="rounded-md bg-[#4C5FD5] px-2.5 py-1 text-[11.5px] font-medium text-white hover:bg-[#3E4EC0]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToInvite(notif.id, notif.invitationToken!, 'decline')}
                            className="rounded-md border border-[#E3E5EC] px-2.5 py-1 text-[11.5px] font-medium text-[#6B7280] hover:text-[#C4453D]"
                          >
                            Decline
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}