import { useEffect, useSyncExternalStore } from 'react';
import { fetchNotificationsApi, acceptInvitationApi, declineInvitationApi } from './api';
import { refreshWorkspaces } from './workspaces';

// ─── Notification type (maps to backend Notification table + included Invitation) ─

export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  /** Present only when this invitation is pending */
  invitationToken: string | null;
  invitationStatus: 'pending' | 'accepted' | 'rejected' | 'expired' | null;
};

// ─── External store ───────────────────────────────────────────────────────────

let notifications: Notification[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return notifications;
}

// ─── Fetch & refresh ─────────────────────────────────────────────────────────

export async function refreshNotifications() {
  try {
    const remote = await fetchNotificationsApi();
    console.log('[Notifications] Raw data from backend:', remote);
    if (Array.isArray(remote)) {
      notifications = remote.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        isRead: item.isRead,
        createdAt: item.createdAt,
        // Extract token only if status is strictly pending
        invitationToken:
          item.invitation?.token && item.invitation.status === 'pending'
            ? item.invitation.token
            : null,
        invitationStatus: item.invitation?.status || null,
      }));
      emitChange();
    }
  } catch (err: any) {
    console.error('[Notifications] Failed to fetch notifications:', err?.message);
  }
}

/** Read the current notification list and re-render whenever it changes. */
export function useNotifications(): Notification[] {
  useEffect(() => {
    refreshNotifications();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ─── Respond to an invitation from a notification ────────────────────────────

export async function respondToInvite(
  notificationId: string,
  token: string,
  decision: 'accept' | 'decline',
): Promise<void> {
  try {
    if (decision === 'accept') {
      await acceptInvitationApi(token);
    } else {
      await declineInvitationApi(token);
    }
  } catch (err: any) {
    console.error('[Invites] Failed to respond to invite:', err?.message);
    throw err;
  }

  // Update notification state in place (remove buttons by clearing invitationToken)
  notifications = notifications
    .map((n) => {
      if (n.id === notificationId) {
        return {
          ...n,
          invitationToken: null,
          invitationStatus: decision === 'accept' ? ('accepted' as const) : ('rejected' as const),
        };
      }
      return n;
    })
    .filter((n) => !(decision === 'decline' && n.id === notificationId));

  emitChange();

  // If accepted, immediately reload the workspaces list so the workspace appears
  if (decision === 'accept') {
    refreshWorkspaces();
  }
}
