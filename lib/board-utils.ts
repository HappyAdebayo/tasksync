import { useSyncExternalStore } from 'react';

export type CardItem = {
  id: string;
  title: string;
  dueDate?: string; // ISO date, e.g. "2026-08-15"
};

export type ListItem = {
  id: string;
  title: string;
  accent: string; // hex, used for the list's identifying dot
  cards: CardItem[];
};

export type Member = {
  initials: string;
  color: string;
};

export type Board = {
  id: string;
  name: string;
  workspaceId: string;
  accent: string;
  description?: string;
  listCount?: number;
  members?: Member[];
};
/** Formats an ISO date like "2026-08-15" as "Aug 15". */
export function formatDueDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Returns Tailwind classes for a due-date badge based on how soon it is. */
export function dueDateTone(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso + 'T00:00:00');
  const daysLeft = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (daysLeft < 0) return 'bg-[#FBEAE9] text-[#C4453D]'; // overdue
  if (daysLeft <= 2) return 'bg-[#FDF3E3] text-[#B4791F]'; // due soon
  return 'bg-[#F1F2F6] text-[#6B7280]'; // later
}

/**
 * Given a card id or list id, returns the id of the list that contains it.
 * Used by the dnd-kit handlers to figure out which column an item belongs to.
 */
export function findContainer(lists: ListItem[], id: string): string | undefined {
  if (lists.some((l) => l.id === id)) return id;
  return lists.find((l) => l.cards.some((c) => c.id === id))?.id;
}


let boards: Board[] = [
  {
    id: 'work',
    name: 'Work',
    workspaceId: 'w1',
    accent: '#4C5FD5',
    listCount: 3,
    members: [
      { initials: 'JD', color: '#4C5FD5' },
      { initials: 'AM', color: '#17C3B2' },
    ],
  },
  {
    id: 'home',
    name: 'Home',
    workspaceId: 'w1',
    accent: '#17C3B2',
    listCount: 2,
    members: [{ initials: 'JD', color: '#4C5FD5' }],
  },
  {
    id: 'job-search',
    name: 'Job Search',
    workspaceId: 'w1',
    accent: '#E8A33D',
    listCount: 5,
    members: [
      { initials: 'JD', color: '#4C5FD5' },
      { initials: 'AM', color: '#17C3B2' },
      { initials: 'RK', color: '#E8A33D' },
    ],
  },
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
  return boards;
}

/** Read the current board list and re-render whenever it changes, from any component. */
export function useBoards(): Board[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function createBoard(input: {
  name: string;
  workspaceId: string;
  accent: string;
  description?: string;
}): Board {
  // TODO: call the API to persist the board, then reconcile the local list with the response.
  const board: Board = { id: crypto.randomUUID(), ...input };
  boards = [...boards, board];
  emitChange();
  return board;
}

export function deleteBoard(id: string): void {
  // TODO: call the API to persist the deletion, then reconcile the local list with the response.
  boards = boards.filter((b) => b.id !== id);
  emitChange();
}