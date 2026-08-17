'use client';
 
import { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createBoard } from '@/lib/board-utils';
import { useWorkspaces } from '@/lib/workspaces';
 
const ACCENTS = ['#4C5FD5', '#17C3B2', '#E8A33D', '#C4453D', '#8A5CF6'];
 
export type NewBoardModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-selects this workspace, e.g. when opened from inside a workspace's board list. */
  defaultWorkspaceId?: string;
  /** Called with the new board's id right after it's created, before onClose. */
  onCreated?: (boardId: string) => void;
};
 
export default function NewBoardModal({ open, onClose, defaultWorkspaceId, onCreated }: NewBoardModalProps) {
  const workspaces = useWorkspaces();
  const [name, setName] = useState('');
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId ?? workspaces[0]?.id ?? '');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
 
  // Reset the form and focus the name field each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setName('');
    setWorkspaceId(defaultWorkspaceId ?? workspaces[0]?.id ?? '');
    setAccent(ACCENTS[0]);
    setDescription('');
    setError('');
    setIsLoading(false);
    const raf = requestAnimationFrame(() => nameRef.current?.focus());
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [open, defaultWorkspaceId, workspaces]);
 
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, isLoading]);
 
  if (!open) return null;
 
  async function submit() {
    if (isLoading) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give your board a name to continue.');
      nameRef.current?.focus();
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const board = await createBoard({
        name: trimmed,
        workspaceId,
        accent,
        description: description.trim() || undefined,
      });
      onCreated?.(board.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create board.');
    } finally {
      setIsLoading(false);
    }
  }
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/40 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-board-title"
        className="w-full max-w-[420px] rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-[0_24px_48px_rgba(23,26,33,0.18)]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="new-board-title" className="text-[17px] font-semibold text-[#101828]">
              Create a new board
            </h2>
            <p className="mt-0.5 text-[13px] text-[#667085]">
              Boards hold your lists and cards for a project.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#667085] transition-colors hover:bg-[#F9FAFB] hover:text-[#101828] disabled:opacity-40 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
 
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="board-name" className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">
              Board name
            </label>
            <input
              id="board-name"
              ref={nameRef}
              disabled={isLoading}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="e.g. Product Launch"
              className={`w-full rounded-lg border bg-[#F9FAFB] px-3 py-2 text-[13.5px] text-[#101828] outline-none transition-colors placeholder:text-[#667085] focus:border-[#4C5FD5] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed ${
                error ? 'border-[#C4453D]' : 'border-[#EAECF0]'
              }`}
            />
            {error && <p className="mt-1 text-[12px] text-[#C4453D]">{error}</p>}
          </div>
 
          {workspaces.length > 0 && (
            <div>
              <label htmlFor="board-workspace" className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">
                Workspace
              </label>
              <select
                id="board-workspace"
                disabled={isLoading}
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2 text-[13.5px] text-[#101828] outline-none transition-colors focus:border-[#4C5FD5] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}
 
          <div>
            <span className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">Color</span>
            <div className="flex items-center gap-2">
              {ACCENTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  disabled={isLoading}
                  aria-label={`Use color ${color}`}
                  aria-pressed={accent === color}
                  onClick={() => setAccent(color)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                  style={{
                    backgroundColor: color,
                    boxShadow: accent === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
 
          <div>
            <label htmlFor="board-description" className="mb-1.5 block text-[12.5px] font-medium text-[#101828]">
              Description <span className="font-normal text-[#667085]">(optional)</span>
            </label>
            <textarea
              id="board-description"
              disabled={isLoading}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board for?"
              className="w-full resize-none rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2 text-[13.5px] text-[#101828] outline-none transition-colors placeholder:text-[#667085] focus:border-[#4C5FD5] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
 
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[#667085] transition-colors hover:bg-[#F9FAFB] hover:text-[#101828] disabled:opacity-40 disabled:pointer-events-none"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#4C5FD5] px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-[#3E4EC0] disabled:opacity-75 disabled:cursor-not-allowed min-w-[115px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              'Create board'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 