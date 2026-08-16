'use client';

import { useState } from 'react';
import { X, Mail, Check } from 'lucide-react';
import { sendInvitationApi } from '@/lib/api';

type Role = 'editor' | 'viewer';

type Member = {
  id: string;
  label: string; // "You" or an email
  role: 'owner' | Role;
  initials: string;
  color: string;
};

const initialMembers: Member[] = [
  { id: 'm0', label: 'You', role: 'owner', initials: 'You', color: '#4C5FD5' },
];

const roleTone: Record<Member['role'], string> = {
  owner: 'bg-[#EEF0FD] text-[#4C5FD5]',
  editor: 'bg-[#E7F7F5] text-[#128A7D]',
  viewer: 'bg-[#F1F2F6] text-[#667085]',
};

export default function InviteModal({
  workspaceId,
  workspaceName,
  isOpen,
  onClose,
}: {
  workspaceId: string;
  workspaceName?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setErrorMessage(null);
    setSentMessage(null);
    

    try {
      await sendInvitationApi({ email: trimmed, workspaceId, role });
      setSentMessage(`Invite sent to ${trimmed}`);
      setEmail('');
      setTimeout(() => setSentMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send invite.');
    }
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/40 px-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Invite to ${workspaceName} board`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl border border-[#EAECF0] bg-white shadow-[0_24px_48px_rgba(23,26,33,0.18)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-[15.5px] font-semibold text-[#101828]">
            Invite to &ldquo;{workspaceName}&rdquo; board
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[#667085] transition-colors hover:bg-[#F9FAFB] hover:text-[#101828]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Send invite */}
        <div className="border-b border-[#EAECF0] px-5 py-4">
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#667085]" htmlFor="invite-email">
            Email address
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="friend@email.com"
            className="w-full rounded-lg border border-[#EAECF0] px-3 py-2 text-[13.5px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#4C5FD5]"
          />

          <div className="mt-3 flex items-center gap-2">
            <label className="text-[12.5px] font-medium text-[#667085]" htmlFor="invite-role">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-[#EAECF0] bg-white px-2.5 py-1.5 text-[13px] text-[#101828] outline-none focus:border-[#4C5FD5]"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            onClick={handleSend}
            disabled={!email.trim()}
            className="mt-3.5 w-full rounded-lg bg-[#4C5FD5] py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0] disabled:cursor-not-allowed disabled:bg-[#C7CCE5]"
          >
            Send Invite
          </button>

          {sentMessage && (
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-medium text-[#128A7D]">
              <Check className="h-3.5 w-3.5" />
              {sentMessage}
            </p>
          )}

          {errorMessage && (
            <p className="mt-2.5 text-[12.5px] font-medium text-[#C4453D]">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Members */}
        <div className="px-5 py-4">
          <h3 className="mb-2.5 text-[12.5px] font-semibold uppercase tracking-wide text-[#667085]">
            Members
          </h3>
          <div className="flex flex-col gap-1">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg px-1.5 py-1.5 hover:bg-[#F9FAFB]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    style={{ backgroundColor: m.color }}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold text-white"
                  >
                    {m.initials}
                  </span>
                  <span className="truncate text-[13.5px] text-[#101828]">{m.label}</span>
                  <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${roleTone[m.role]}`}>
                    {m.role}
                  </span>
                </div>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => removeMember(m.id)}
                    aria-label={`Remove ${m.label}`}
                    className="ml-2 flex-shrink-0 rounded-md p-1 text-[#98A2B3] transition-colors hover:bg-[#FBEAE9] hover:text-[#C4453D]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
