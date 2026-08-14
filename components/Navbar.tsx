'use client';
 
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown, Bell, Folder, Building2, User, Mail } from 'lucide-react';
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
 
/** Bolds the substring of `label` that matched `query`. */
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [backendSearchItems, setBackendSearchItems] = useState<SearchItem[]>([]);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
 
  const accountRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
 
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const boards = useBoards();
  const workspaces = useWorkspaces();
 
  // 3-second debounced search query
  const debouncedQuery = useDebounceValue(query, 3000);
 
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Fetch backend search results using 3-second debounced query
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
        // Fallback to local index
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
      if (accountRef.current && !accountRef.current.contains(target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setResultsOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNotifOpen(false);
        setResultsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
 
  function handleLogout() {
    clearAuthToken();
    window.location.href = '/login';
  }
 
  const userName = user?.name || user?.email || 'Jordan Diaz';
  const userInitials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'JD';
 
  return (
    <nav
      className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-[#E3E5EC] bg-white px-7 py-3.5"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <a href="/" className="flex flex-shrink-0 items-center gap-2.5" aria-label="Tasksync home">
        <span className="relative h-[30px] w-[30px]" aria-hidden="true">
          <span className="absolute left-0 top-0 h-[19px] w-[19px] rounded-[6px] bg-[#4C5FD5]" />
          <span className="absolute bottom-0 right-0 h-[19px] w-[19px] rounded-[6px] border-[1.5px] border-[#4C5FD5] bg-[#EEF0FD]" />
          <span className="absolute left-[10px] top-[10px] h-2 w-2 animate-[pulse_2.4s_ease-in-out_infinite] rounded-full bg-[#17C3B2] shadow-[0_0_0_3px_white] motion-reduce:animate-none" />
        </span>
        <span className="font-[family-name:var(--font-display)] text-[19px] font-semibold tracking-tight text-[#171A21]">
          tasksync
        </span>
      </a>
 
      {/* Search */}
      <div className="relative max-w-[420px] flex-1 max-[640px]:hidden" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-full border border-[#E3E5EC] bg-[#F6F7FB] px-3.5 py-2 transition-colors focus-within:border-[#4C5FD5] focus-within:bg-white">
          <Search className="h-4 w-4 flex-shrink-0 stroke-[#6B7280]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResultsOpen(true);
            }}
            onFocus={() => query && setResultsOpen(true)}
            placeholder="Search boards, tasks, people…"
            aria-label="Search"
            role="combobox"
            aria-expanded={resultsOpen}
            aria-controls="search-results"
            autoComplete="off"
            className="w-full bg-transparent text-sm text-[#171A21] placeholder:text-[#6B7280] outline-none"
          />
        </div>
 
        {resultsOpen && query && (
          <div
            id="search-results"
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-[360px] overflow-y-auto rounded-[10px] border border-[#E3E5EC] bg-white p-1.5 shadow-[0_8px_24px_rgba(23,26,33,0.08)]"
          >
            {results.length === 0 ? (
              <p className="px-2.5 py-3 text-[13px] text-[#6B7280]">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              (Object.keys(grouped) as SearchItem['type'][]).map((type) => {
                const { label, icon: Icon } = TYPE_META[type];
                return (
                  <div key={type} className="mb-1 last:mb-0">
                    <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                      {label}
                    </p>
                    {grouped[type]!.map((item) => (
                      <button
                        key={item.id}
                        role="option"
                        aria-selected={false}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-[#F6F7FB]"
                        onClick={() => {
                          setQuery(item.label);
                          setResultsOpen(false);
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 stroke-[#6B7280]" />
                        <span className="min-w-0 truncate text-[13.5px] text-[#171A21]">
                          <HighlightedLabel label={item.label} query={query} />
                        </span>
                        {item.meta && (
                          <span className="ml-auto flex-shrink-0 truncate text-[12px] text-[#6B7280]">
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
 
      <div className="flex flex-shrink-0 items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#6B7280] transition-colors hover:border-[#E3E5EC] hover:bg-[#F6F7FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4C5FD5] focus-visible:outline-offset-2"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-white bg-[#C4453D]" />
            )}
          </button>
 
          {notifOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] w-[300px] rounded-[10px] border border-[#E3E5EC] bg-white shadow-[0_8px_24px_rgba(23,26,33,0.08)]"
            >
              <div className="flex items-center gap-2 border-b border-[#E3E5EC] px-3.5 py-2.5">
                <Mail className="h-4 w-4 text-[#4C5FD5]" />
                <p className="text-[13px] font-medium text-[#171A21]">Notifications</p>
              </div>
 
              {notifications.length === 0 ? (
                <p className="px-3.5 py-6 text-center text-[13px] text-[#6B7280]">
                  You&rsquo;re all caught up.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-[#E3E5EC] max-h-[320px] overflow-y-auto">
                  {notifications.map((notif) =>{ 
                    return (
                    <div
                      key={notif.id}
                      className={`flex flex-col gap-1.5 px-3.5 py-3 ${
                        !notif.isRead ? 'bg-[#F6F7FB]' : ''
                      }`}
                    >
                      <p className="text-[12.5px] font-semibold text-[#171A21]">{notif.title}</p>
                      <p className="text-[13px] text-[#6B7280]">{notif.message}</p>
                      <p className="text-[11.5px] text-[#B0B4C0]">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                      {notif.invitationToken && notif.invitationStatus === 'pending' ? (
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            onClick={() => respondToInvite(notif.id, notif.invitationToken!, 'accept')}
                            className="rounded-lg bg-[#4C5FD5] px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToInvite(notif.id, notif.invitationToken!, 'decline')}
                            className="rounded-lg border border-[#E3E5EC] px-3 py-1.5 text-[12.5px] font-medium text-[#6B7280] transition-colors hover:border-[#C4453D] hover:text-[#C4453D]"
                          >
                            Decline
                          </button>
                        </div>
                      ) : notif.invitationStatus === 'accepted' ? (
                        <span className="inline-block w-fit rounded bg-emerald-50 px-2 py-0.5 text-[11.5px] font-medium text-emerald-600">
                          Accepted
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}
        </div>
 
        {/* Account menu */}
        <div className="relative flex-shrink-0" ref={accountRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-full border border-transparent py-[5px] pl-[5px] pr-2.5 transition-colors hover:border-[#E3E5EC] hover:bg-[#F6F7FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4C5FD5] focus-visible:outline-offset-2"
          >
            <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C5FD5] to-[#7B8AF0] text-[13px] font-semibold text-white">
              {userInitials}
              <span className="absolute -bottom-px -right-px h-[9px] w-[9px] rounded-full border-2 border-white bg-[#17C3B2]" />
            </span>
            <span className="text-sm font-medium text-[#171A21] max-[640px]:hidden">{userName}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 stroke-[#6B7280] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>
 
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] min-w-[190px] rounded-[10px] border border-[#E3E5EC] bg-white p-1.5 shadow-[0_8px_24px_rgba(23,26,33,0.08)]"
            >
              <button role="menuitem" className="w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-[#171A21] hover:bg-[#F6F7FB]">
                Profile
              </button>
              <button role="menuitem" className="w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-[#171A21] hover:bg-[#F6F7FB]">
                Settings
              </button>
              <hr className="my-1.5 border-[#E3E5EC]" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-[#C4453D] hover:bg-[#F6F7FB]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}