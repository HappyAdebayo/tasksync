import { useSyncExternalStore } from 'react';
 
export type Workspace = {
  id: string;
  name: string;
  accent: string;
};
 
let workspaces: Workspace[] = [
  { id: 'w1', name: 'Company OS', accent: '#4C5FD5' },
  { id: 'w2', name: 'Creative Studio', accent: '#17C3B2' },
  { id: 'w3', name: 'Client Success', accent: '#E8A33D' },
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
  return workspaces;
}
 
/** Read the current workspace list and re-render whenever it changes, from any component. */
export function useWorkspaces(): Workspace[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
 
/** One-off, non-reactive lookup — fine outside render (e.g. building a title string). */
export function getWorkspace(id: string): Workspace | undefined {
  return workspaces.find((w) => w.id === id);
}
 
export function createWorkspace(input: { name: string; accent: string }): Workspace {
  // TODO: call the API to persist the workspace, then reconcile the local list with the response.
  const workspace: Workspace = { id: crypto.randomUUID(), ...input };
  workspaces = [...workspaces, workspace];
  emitChange();
  return workspace;
}
 
export function deleteWorkspace(id: string): void {
  // TODO: call the API to persist the deletion, then reconcile the local list with the response.
  workspaces = workspaces.filter((w) => w.id !== id);
  emitChange();
}