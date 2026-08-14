'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createWorkspace } from '@/lib/workspaces';

const ACCENTS = ['#4C5FD5', '#17C3B2', '#E8A33D', '#C4453D', '#8A5CF6'];

export type NewWorkspaceModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called with the new workspace's id right after it's created, before onClose. */
  onCreated?: (workspaceId: string) => void;
};

export default function NewWorkspaceModal({ open, onClose, onCreated }: NewWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setAccent(ACCENTS[0]);
    setError('');
    const raf = requestAnimationFrame(() => nameRef.current?.focus());
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give your workspace a name to continue.');
      nameRef.current?.focus();
      return;
    }
    try {
      const workspace = await createWorkspace({ name: trimmed, accent });
      onCreated?.(workspace.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create workspace.');
    }
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
        aria-labelledby="new-workspace-title"
        className="w-full max-w-[400px] rounded-2xl border border-[#E3E5EC] bg-white p-6 shadow-[0_24px_48px_rgba(23,26,33,0.18)]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="new-workspace-title" className="text-[17px] font-semibold text-[#171A21]">
              Create a new workspace
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              Workspaces group boards for a team or project.
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
            <label htmlFor="workspace-name" className="mb-1.5 block text-[12.5px] font-medium text-[#171A21]">
              Workspace name
            </label>
            <input
              id="workspace-name"
              ref={nameRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="e.g. Marketing"
              className={`w-full rounded-lg border bg-[#F6F7FB] px-3 py-2 text-[13.5px] text-[#171A21] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#4C5FD5] focus:bg-white ${
                error ? 'border-[#C4453D]' : 'border-[#E3E5EC]'
              }`}
            />
            {error && <p className="mt-1 text-[12px] text-[#C4453D]">{error}</p>}
          </div>

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
            Create workspace
          </button>
        </div>
      </div>
    </div>
  );
}
