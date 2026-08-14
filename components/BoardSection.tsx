'use client';

import { Plus, ChevronLeft, LayoutGrid, Trash2 } from 'lucide-react';
import { useState } from 'react';
import NewBoardModal from './NewBoardModal';
import { useBoards, deleteBoard, type Board } from '@/lib/board-utils';
import { useWorkspaces } from '@/lib/workspaces';
import InviteModal from './InviteModal';

function AvatarStack({ members }: { members: NonNullable<Board['members']> }) {
  return (
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
  );
}

function BoardCard({
  board,
  onSelect,
  pendingDelete,
  onDeleteClick,
}: {
  board: Board;
  onSelect: (boardId: string) => void;
  pendingDelete: boolean;
  onDeleteClick: (e: React.MouseEvent) => void;
}) {
  const listCount = board.listCount ?? 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E3E5EC] bg-white text-left transition-all hover:-translate-y-0.5 hover:border-[#D3D7E3] hover:shadow-[0_8px_20px_rgba(23,26,33,0.06)]">
      <button onClick={() => onSelect(board.id)} className="flex flex-1 flex-col text-left">
        <span className="block h-1.5 w-full" style={{ backgroundColor: board.accent }} aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-[#171A21]">
              {board.name}
            </h3>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              {listCount} {listCount === 1 ? 'list' : 'lists'}
            </p>
          </div>
          {board.members && board.members.length > 0 && <AvatarStack members={board.members} />}
        </div>
      </button>

      <button
        onClick={onDeleteClick}
        onBlur={(e) => {
          // allow the click to register before we reset on blur
          if (!pendingDelete) return;
        }}
        className={`absolute right-3 top-3 flex h-7 items-center gap-1 rounded-full px-2 text-[11.5px] font-medium transition-all ${
          pendingDelete
            ? 'bg-red-500 text-white'
            : 'bg-white text-[#B0B4C0] opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100'
        }`}
        title={pendingDelete ? 'Click again to confirm' : 'Delete board'}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {pendingDelete && 'Confirm'}
      </button>
    </div>
  );
}

export default function BoardsSection({
  workspaceId,
  onBack,
  onSelectBoard,
}: {
  workspaceId: string;
  onBack: () => void;
  onSelectBoard: (boardId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const allBoards = useBoards();
  const workspaces = useWorkspaces();
  const workspace = workspaces.find((w) => w.id === workspaceId);
  const boards = allBoards.filter((b) => b.workspaceId === workspaceId);

  const handleDeleteClick = (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (pendingDeleteId === boardId) {
      deleteBoard(boardId);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(boardId);
    }
  };

  return (
    <section className="mx-auto max-w-[1100px] px-7 py-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#4C5FD5]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Workspaces
      </button>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: workspace?.accent }} />
          <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold text-[#171A21]">
            {workspace?.name ?? 'Boards'}
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#4C5FD5] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
          >
            <Plus className="h-4 w-4" />
            New Board
          </button>
          <button
            onClick={() => setOpenInviteModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#4C5FD5] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
          >
            <Plus className="h-4 w-4" />
            Invite Members
          </button>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#D3D7E3] px-6 py-14 text-center">
          <LayoutGrid className="h-6 w-6 text-[#B0B4C0]" />
          <p className="text-[13.5px] font-medium text-[#171A21]">No boards yet</p>
          <p className="text-[12.5px] text-[#6B7280]">Create the first board for this workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onSelect={onSelectBoard}
              pendingDelete={pendingDeleteId === board.id}
              onDeleteClick={(e) => handleDeleteClick(e, board.id)}
            />
          ))}
        </div>
      )}

      <NewBoardModal
        open={open}
        onClose={() => setOpen(false)}
        defaultWorkspaceId={workspaceId}
        onCreated={onSelectBoard}
      />
      <InviteModal workspaceName={workspace?.name} isOpen={openInviteModal} onClose={() => setOpenInviteModal(false)} />
    </section>
  );
}