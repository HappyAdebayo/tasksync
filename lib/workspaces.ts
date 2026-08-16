import { useEffect, useSyncExternalStore } from 'react';
import { fetchWorkspacesApi, createWorkspaceApi, deleteWorkspaceApi } from './api';

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';

export type Workspace = {
  id: string;
  name: string;
  accent: string;
  role?: WorkspaceRole;
};

const ACCENTS = ['#4C5FD5', '#17C3B2', '#E8A33D', '#C4453D', '#8A5CF6'];

let workspaces: Workspace[] = [];

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
  return workspaces;
}

export async function refreshWorkspaces() {
  try {
    const remote = await fetchWorkspacesApi();
    if (Array.isArray(remote)) {
      workspaces = remote.map((w: any, i) => ({
        id: w.id,
        name: w.name,
        accent: ACCENTS[i % ACCENTS.length],
        role: (w.role as WorkspaceRole) || 'owner',
      }));
      emitChange();
    }
  } catch (err) {
    // Keep local cache if offline/unauthorized
  }
}

/** Read the current workspace list and re-render whenever it changes. Loads from backend on mount. */
export function useWorkspaces(): Workspace[] {
  useEffect(() => {
    refreshWorkspaces();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** One-off, non-reactive lookup. */
export function getWorkspace(id: string): Workspace | undefined {
  return workspaces.find((w) => w.id === id);
}

export async function createWorkspace(input: { name: string; accent: string }): Promise<Workspace> {
  const accent = input.accent || ACCENTS[workspaces.length % ACCENTS.length];
  try {
    const created: any = await createWorkspaceApi({ name: input.name });
    const workspace: Workspace = {
      id: created.id,
      name: created.name || input.name,
      accent,
      role: 'owner',
    };
    workspaces = [...workspaces, workspace];
    emitChange();
    return workspace;
  } catch {
    // Optimistic fallback
    const workspace: Workspace = { id: crypto.randomUUID(), name: input.name, accent, role: 'owner' };
    workspaces = [...workspaces, workspace];
    emitChange();
    return workspace;
  }
}

export async function deleteWorkspace(id: string): Promise<void> {
  // Delete via API first
  await deleteWorkspaceApi(id);

  // Remove from state only after successful API call
  workspaces = workspaces.filter((w) => w.id !== id);
  emitChange();
}