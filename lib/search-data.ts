import type { Board } from './board-utils';
import type { Workspace } from './workspaces';

export type SearchItem = {
  id: string;
  label: string;
  type: 'workspace' | 'board' | 'person';
  /** Secondary line, e.g. the workspace a board belongs to. */
  meta?: string;
};

const people: SearchItem[] = [
  { id: 'p1', label: 'Carlos Mendes', type: 'person' },
  { id: 'p2', label: 'Casey Lin', type: 'person' },
  { id: 'p3', label: 'Priya Chandran', type: 'person' },
  { id: 'p4', label: 'Jordan Diaz', type: 'person' },
  { id: 'p5', label: 'Marcus Webb', type: 'person' },
  /**
   * Wire this up to a real endpoint whenever one exists — swap this array
   * for a fetch/query result and buildSearchIndex keeps working.
   */
];

/** Builds a fresh search index from the current workspaces + boards, so new boards show up immediately. */
export function buildSearchIndex(workspaces: Workspace[], boards: Board[]): SearchItem[] {
  const workspaceNameById = new Map(workspaces.map((w) => [w.id, w.name]));
  return [
    ...workspaces.map((w) => ({ id: w.id, label: w.name, type: 'workspace' as const })),
    ...boards.map((b) => ({
      id: b.id,
      label: b.name,
      type: 'board' as const,
      meta: workspaceNameById.get(b.workspaceId),
    })),
    ...people,
  ];
}

/** Case-insensitive substring match against label (and meta, if present). */
export function searchItems(index: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index.filter(
    (item) => item.label.toLowerCase().includes(q) || item.meta?.toLowerCase().includes(q)
  );
}
