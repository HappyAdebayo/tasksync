'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, UserPlus, Eye, Shield } from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';
import InviteModal from '@/components/InviteModal';
import { useBoards } from '@/lib/board-utils';
import { useWorkspaces } from '@/lib/workspaces';

function AvatarStack({ members }: { members: { initials: string; color: string }[] }) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <span
          key={m.initials + i}
          style={{ backgroundColor: m.color, zIndex: members.length - i }}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10.5px] font-bold text-white shadow-xs ${
            i > 0 ? '-ml-1.5' : ''
          }`}
        >
          {m.initials}
        </span>
      ))}
    </div>
  );
}

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.boardId;
  const router = useRouter();

  const boards = useBoards();
  const workspaces = useWorkspaces();
  const currentBoard = boards.find((b) => b.id === boardId);
  const workspace = workspaces.find((w) => w.id === currentBoard?.workspaceId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isReadOnly = workspace?.role === 'viewer';

  return (
    <div className="flex h-full flex-col bg-[#F6F7FB]">
      {/* Board Top Header Subbar */}
      <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-[#E3E5EC] bg-white px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/workspaces"
            className="flex items-center gap-1 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#171A21]"
          >
            <ChevronLeft className="h-4 w-4" />
            Workspaces
          </Link>
          <span className="text-[#D3D7E3]">/</span>
          {workspace && (
            <>
              <Link
                href={`/dashboard/workspaces?workspace=${workspace.id}`}
                className="text-[13px] font-medium text-[#6B7280] hover:text-[#171A21]"
              >
                {workspace.name}
              </Link>
              <span className="text-[#D3D7E3]">/</span>
            </>
          )}
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full shadow-xs"
            style={{ backgroundColor: currentBoard?.accent || '#4C5FD5' }}
          />
          <h1 className="truncate font-[family-name:var(--font-display)] text-[16px] font-bold text-[#171A21]">
            {currentBoard?.name ?? 'Board'}
          </h1>

          {workspace?.role && (
            <span
              className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold border ${
                isReadOnly
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : workspace.role === 'owner'
                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              {isReadOnly ? <Eye className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
              {isReadOnly ? 'Viewer' : workspace.role === 'owner' ? 'Owner' : 'Editor'}
            </span>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          {currentBoard?.members && currentBoard.members.length > 0 && (
            <AvatarStack members={currentBoard.members} />
          )}

          {workspace?.role === 'owner' && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#E3E5EC] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-[#171A21] shadow-xs transition-all hover:border-[#4C5FD5] hover:text-[#4C5FD5]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </button>
          )}
        </div>
      </header>

      {/* Kanban Board Canvas */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard boardId={boardId} readOnly={isReadOnly} />
      </div>

      {workspace && (
        <InviteModal
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  );
}
