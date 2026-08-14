import { useSyncExternalStore } from 'react';

export type Invite = {
  id: string;
  boardName: string;
  boardAccent: string;
  inviterName: string;
};

let invites: Invite[] = [
  { id: 'i1', boardName: 'Work', boardAccent: '#4C5FD5', inviterName: 'Sarah' },
];

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
  return invites;
}

/** Read the current invite list and re-render whenever it changes, from any component. */
export function useInvites(): Invite[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function respondToInvite(id: string, _decision: 'accept' | 'decline') {
  // TODO: call the API to accept/decline, then remove it from the list on success.
  invites = invites.filter((i) => i.id !== id);
  emitChange();
}
