'use client';

import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Mail,
  Users,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
  Check,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useNotifications, refreshNotifications, respondToInvite, type Notification } from '@/lib/invites';
import { useSocket } from '@/lib/socket';

export default function NotificationsPage() {
  const notifications = useNotifications();
  const { isConnected } = useSocket();

  const [filter, setFilter] = useState<'all' | 'unread' | 'invitations'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const invitationNotifications = notifications.filter((n) => n.invitationToken !== null);

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'invitations') return n.invitationToken !== null;
    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleInviteResponse = async (
    notificationId: string,
    token: string,
    decision: 'accept' | 'decline'
  ) => {
    try {
      await respondToInvite(notificationId, token, decision);
      setActionMessage(
        decision === 'accept' ? 'Workspace invitation accepted!' : 'Workspace invitation declined.'
      );
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err?.message || 'Failed to process invitation.');
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-semibold text-emerald-800 shadow-lg animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold text-[#171A21] tracking-tight">
              Notifications
            </h1>
            {unreadNotifications.length > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-[#C4453D] px-2 text-[11px] font-bold text-white">
                {unreadNotifications.length} unread
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13.5px] text-[#6B7280]">
            Stay updated with workspace invites, task updates, and team mentions in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-[#E3E5EC] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#171A21] shadow-xs hover:border-[#4C5FD5] hover:text-[#4C5FD5] transition-all disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="mb-6 flex items-center justify-between border-b border-[#E3E5EC] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#4C5FD5] text-white shadow-xs'
                : 'bg-white border border-[#E3E5EC] text-[#6B7280] hover:border-[#D3D7E3] hover:text-[#171A21]'
            }`}
          >
            All
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                filter === 'all' ? 'bg-white/20 text-white' : 'bg-[#F0F2F7] text-[#6B7280]'
              }`}
            >
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-[#4C5FD5] text-white shadow-xs'
                : 'bg-white border border-[#E3E5EC] text-[#6B7280] hover:border-[#D3D7E3] hover:text-[#171A21]'
            }`}
          >
            Unread
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                filter === 'unread' ? 'bg-white/20 text-white' : 'bg-[#F0F2F7] text-[#6B7280]'
              }`}
            >
              {unreadNotifications.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('invitations')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
              filter === 'invitations'
                ? 'bg-[#4C5FD5] text-white shadow-xs'
                : 'bg-white border border-[#E3E5EC] text-[#6B7280] hover:border-[#D3D7E3] hover:text-[#171A21]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Invitations
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                filter === 'invitations' ? 'bg-white/20 text-white' : 'bg-[#F0F2F7] text-[#6B7280]'
              }`}
            >
              {invitationNotifications.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#8E95A5]">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          {isConnected ? 'Real-time sync active' : 'Connecting to gateway...'}
        </div>
      </div>

      {/* Notifications List */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D3D7E3] bg-white px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0FD] text-[#4C5FD5]">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-[16px] font-semibold text-[#171A21]">
            {filter === 'unread'
              ? 'No unread notifications'
              : filter === 'invitations'
              ? 'No pending invitations'
              : 'You have no notifications'}
          </h3>
          <p className="mt-1 text-[13px] text-[#6B7280] max-w-sm">
            {filter === 'unread'
              ? "You're all caught up with everything!"
              : filter === 'invitations'
              ? 'Any new workspace collaboration requests will appear right here.'
              : 'Updates about your tasks, boards, and team invitations will show up here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredList.map((notif) => {
            const isInvite = notif.invitationToken !== null;
            const isPending = notif.invitationStatus === 'pending';

            return (
              <div
                key={notif.id}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 transition-all duration-200 ${
                  !notif.isRead
                    ? 'border-[#4C5FD5]/30 bg-white shadow-xs ring-1 ring-[#4C5FD5]/10'
                    : 'border-[#E3E5EC] bg-white hover:border-[#D3D7E3]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                      isInvite
                        ? 'bg-[#EEF0FD] text-[#4C5FD5]'
                        : 'bg-[#F0F2F7] text-[#6B7280]'
                    }`}
                  >
                    {isInvite ? <Users className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[14.5px] text-[#171A21]">{notif.title}</h3>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#4C5FD5] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[13.5px] text-[#6B7280] leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1 text-[11.5px] text-[#8E95A5]">
                        <Clock className="h-3 w-3" />
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {notif.invitationStatus && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${
                            notif.invitationStatus === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : notif.invitationStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {notif.invitationStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isInvite && isPending && notif.invitationToken && (
                  <div className="flex flex-shrink-0 items-center gap-2 sm:self-center">
                    <button
                      onClick={() =>
                        handleInviteResponse(notif.id, notif.invitationToken!, 'accept')
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-[#4C5FD5] px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#3E4EC0] shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleInviteResponse(notif.id, notif.invitationToken!, 'decline')
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-[#E3E5EC] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#6B7280] transition-colors hover:border-[#C4453D] hover:text-[#C4453D]"
                    >
                      <X className="h-3.5 w-3.5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
