'use client';

import { ChevronLeft } from 'lucide-react';
import { useBoards } from '@/lib/board-utils';
import KanbanBoard from './KanbanBoard';

export default function ProjectView({
  boardId,
  onBack,
}: {
  boardId: string;
  onBack: () => void;
}) {
  const boards = useBoards();
  const board = boards.find((b) => b.id === boardId);

  return (
    <section className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#E3E5EC] bg-white px-7 py-3.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#4C5FD5]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Boards
        </button>
        <span className="h-4 w-px bg-[#E3E5EC]" />
        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: board?.accent }} />
        <h1 className="text-[14.5px] font-semibold text-[#171A21]">{board?.name ?? 'Board'}</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        {/*
          KanbanBoard currently always renders the same demo lists/cards
          regardless of which board you came from. To make each board's
          contents actually differ, KanbanBoard's initialLists would need
          to be looked up by `boardId` from a real lists/cards store
          (same pattern as lib/boards.ts) — happy to wire that up next.
        */}
        <KanbanBoard boardId={boardId} />
      </div>
    </section>
  );
}
