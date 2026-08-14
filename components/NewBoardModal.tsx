'use client';
 
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
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
  const nameRef = useRef<HTMLInputElement>(null);
 
  // Reset the form and focus the name field each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setName('');
    setWorkspaceId(defaultWorkspaceId ?? workspaces[0]?.id ?? '');
    setAccent(ACCENTS[0]);
    setDescription('');
    setError('');
    const raf = requestAnimationFrame(() => nameRef.current?.focus());
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [open, defaultWorkspaceId]);
 
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);
 
  if (!open) return null;
 
  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give your board a name to continue.');
      nameRef.current?.focus();
      return;
    }
    const board = createBoard({
      name: trimmed,
      workspaceId,
      accent,
      description: description.trim() || undefined,
    });
    onCreated?.(board.id);
    onClose();
  }
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171A21]/40 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-board-title"
        className="w-full max-w-[420px] rounded-2xl border border-[#E3E5EC] bg-white p-6 shadow-[0_24px_48px_rgba(23,26,33,0.18)]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="new-board-title" className="text-[17px] font-semibold text-[#171A21]">
              Create a new board
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              Boards hold your lists and cards for a project.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F6F7FB] hover:text-[#171A21]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
 
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="board-name" className="mb-1.5 block text-[12.5px] font-medium text-[#171A21]">
              Board name
            </label>
            <input
              id="board-name"
              ref={nameRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="e.g. Product Launch"
              className={`w-full rounded-lg border bg-[#F6F7FB] px-3 py-2 text-[13.5px] text-[#171A21] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#4C5FD5] focus:bg-white ${
                error ? 'border-[#C4453D]' : 'border-[#E3E5EC]'
              }`}
            />
            {error && <p className="mt-1 text-[12px] text-[#C4453D]">{error}</p>}
          </div>
 
          {workspaces.length > 0 && (
            <div>
              <label htmlFor="board-workspace" className="mb-1.5 block text-[12.5px] font-medium text-[#171A21]">
                Workspace
              </label>
              <select
                id="board-workspace"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full rounded-lg border border-[#E3E5EC] bg-[#F6F7FB] px-3 py-2 text-[13.5px] text-[#171A21] outline-none transition-colors focus:border-[#4C5FD5] focus:bg-white"
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
            <span className="mb-1.5 block text-[12.5px] font-medium text-[#171A21]">Color</span>
            <div className="flex items-center gap-2">
              {ACCENTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use color ${color}`}
                  aria-pressed={accent === color}
                  onClick={() => setAccent(color)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-105"
                  style={{
                    backgroundColor: color,
                    boxShadow: accent === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
 
          <div>
            <label htmlFor="board-description" className="mb-1.5 block text-[12.5px] font-medium text-[#171A21]">
              Description <span className="font-normal text-[#6B7280]">(optional)</span>
            </label>
            <textarea
              id="board-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board for?"
              className="w-full resize-none rounded-lg border border-[#E3E5EC] bg-[#F6F7FB] px-3 py-2 text-[13.5px] text-[#171A21] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#4C5FD5] focus:bg-white"
            />
          </div>
        </div>
 
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[#6B7280] transition-colors hover:bg-[#F6F7FB] hover:text-[#171A21]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-[#4C5FD5] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
          >
            Create board
          </button>
        </div>
      </div>
    </div>
  );
}
 