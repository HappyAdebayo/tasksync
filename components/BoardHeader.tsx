'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import InviteModal from '@/components/InviteModal';

type Member = {
  initials: string;
  color: string;
};

export default function BoardHeader({
  boardName,
  accent,
  members,
}: {
  boardName: string;
  accent: string;
  members: Member[];
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#EAECF0] bg-white px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to Tasksync"
            className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#667085] transition-colors hover:text-[#101828]"
          >
            <ArrowLeft className="h-4 w-4" />
            Tasksync
          </Link>
          <span className="text-[#D0D5DD]">/</span>
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
          <h1 className="truncate font-[family-name:var(--font-display)] text-[16px] font-semibold text-[#101828]">
            {boardName}
          </h1>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="flex items-center">
            {members.map((m, i) => (
              <span
                key={m.initials}
                style={{ backgroundColor: m.color, zIndex: members.length - i }}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10.5px] font-semibold text-white ${
                  i > 0 ? '-ml-2' : ''
                }`}
              >
                {m.initials}
              </span>
            ))}
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[#EAECF0] px-3.5 py-1.5 text-[13px] font-medium text-[#101828] transition-colors hover:border-[#4C5FD5] hover:text-[#4C5FD5]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </button>
        </div>
      </header>

    </>
  );
}
