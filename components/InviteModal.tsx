'use client';

import { useState } from 'react';
import { X, Mail, Check } from 'lucide-react';

type Role = 'editor' | 'viewer';

type Member = {
  id: string;
  label: string; // "You" or an email
  role: 'owner' | Role;
  initials: string;
  color: string;
};

const initialMembers: Member[] = [
  { id: 'm0', label: 'You', role: 'owner', initials: 'JD', color: '#4C5FD5' },
  { id: 'm1', label: 'sarah@email.com', role: 'editor', initials: 'S', color: '#17C3B2' },
  { id: 'm2', label: 'mike@email.com', role: 'viewer', initials: 'M', color: '#E8A33D' },
];

const roleTone: Record<Member['role'], string> = {
  owner: 'bg-[#EEF0FD] text-[#4C5FD5]',
  editor: 'bg-[#E7F7F5] text-[#128A7D]',
  viewer: 'bg-[#F1F2F6] text-[#6B7280]',
};

export default function InviteModal({
  workspaceName,
  isOpen,
  onClose,
}: {
  workspaceName: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;

    // TODO: replace with a real API call. On success, either the invitee
    // gets added directly (if they already have an account) or receives
    // a pending invite that shows up on their dashboard.
    setSentMessage(`Invite sent to ${trimmed}`);
    setEmail('');
    setTimeout(() => setSentMessage(null), 3000);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171A21]/40 px-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Invite to ${workspaceName} board`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl border border-[#E3E5EC] bg-white shadow-[0_24px_48px_rgba(23,26,33,0.18)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E5EC] px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-[15.5px] font-semibold text-[#171A21]">
            Invite to &ldquo;{workspaceName}&rdquo; board
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[#6B7280] transition-colors hover:bg-[#F6F7FB] hover:text-[#171A21]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Send invite */}
        <div className="border-b border-[#E3E5EC] px-5 py-4">
          <label className="mb-1.5 block text-[12.5px] font-medium text-[#6B7280]" htmlFor="invite-email">
            Email address
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="friend@email.com"
            className="w-full rounded-lg border border-[#E3E5EC] px-3 py-2 text-[13.5px] text-[#171A21] outline-none transition-colors placeholder:text-[#B0B4C0] focus:border-[#4C5FD5]"
          />

          <div className="mt-3 flex items-center gap-2">
            <label className="text-[12.5px] font-medium text-[#6B7280]" htmlFor="invite-role">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-[#E3E5EC] bg-white px-2.5 py-1.5 text-[13px] text-[#171A21] outline-none focus:border-[#4C5FD5]"
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
        </div>

        {/* Members */}
        <div className="px-5 py-4">
          <h3 className="mb-2.5 text-[12.5px] font-semibold uppercase tracking-wide text-[#6B7280]">
            Members
          </h3>
          <div className="flex flex-col gap-1">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg px-1.5 py-1.5 hover:bg-[#F6F7FB]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    style={{ backgroundColor: m.color }}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold text-white"
                  >
                    {m.initials}
                  </span>
                  <span className="truncate text-[13.5px] text-[#171A21]">{m.label}</span>
                  <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${roleTone[m.role]}`}>
                    {m.role}
                  </span>
                </div>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => removeMember(m.id)}
                    aria-label={`Remove ${m.label}`}
                    className="ml-2 flex-shrink-0 rounded-md p-1 text-[#B0B4C0] transition-colors hover:bg-[#FBEAE9] hover:text-[#C4453D]"
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
