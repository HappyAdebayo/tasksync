import { useEffect, useSyncExternalStore } from 'react';
import { fetchBoardsApi, createBoardApi, deleteBoardApi } from './api';

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
  return 'bg-[#F1F2F6] text-[#667085]'; // later
}

/**
 * Given a card id or list id, returns the id of the list that contains it.
 * Used by the dnd-kit handlers to figure out which column an item belongs to.
 */
export function findContainer(lists: ListItem[], id: string): string | undefined {
  if (lists.some((l) => l.id === id)) return id;
  return lists.find((l) => l.cards.some((c) => c.id === id))?.id;
}

let boards: Board[] = [];

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

export async function refreshBoards() {
  try {
    const remote = await fetchBoardsApi();
    if (Array.isArray(remote)) {
      boards = remote.map((b) => ({
        id: b.id,
        name: b.name,
        workspaceId: b.workspaceId,
        accent: b.color || '#4C5FD5',
        description: b.description,
        members: [{ initials: 'JD', color: '#4C5FD5' }],
      }));
      emitChange();
    }
  } catch (err) {
    // Keep local cache if offline/unauthorized
  }
}

/** Read the current board list and re-render whenever it changes. */
export function useBoards(): Board[] {
  useEffect(() => {
    refreshBoards();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function createBoard(input: {
  name: string;
  workspaceId: string;
  accent: string;
  description?: string;
}): Promise<Board> {
  try {
    const created = await createBoardApi({
      name: input.name,
      color: input.accent,
      description: input.description,
      workspaceId: input.workspaceId,
    });
    const board: Board = {
      id: created.id,
      name: created.name || input.name,
      workspaceId: created.workspaceId || input.workspaceId,
      accent: created.color || input.accent,
      description: created.description || input.description,
      members: [{ initials: 'JD', color: '#4C5FD5' }],
    };
    boards = [...boards, board];
    emitChange();
    return board;
  } catch {
    const board: Board = {
      id: crypto.randomUUID(),
      ...input,
      members: [{ initials: 'JD', color: '#4C5FD5' }],
    };
    boards = [...boards, board];
    emitChange();
    return board;
  }
}

export async function deleteBoard(id: string): Promise<void> {
  // Delete via API first
  await deleteBoardApi(id);

  // Remove from state only after successful API call
  boards = boards.filter((b) => b.id !== id);
  emitChange();
}