'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import BoardHeader from '@/components/BoardHeader';
import KanbanBoard from '@/components/KanbanBoard';
import { getAuthToken } from '@/lib/api';
import { useBoards } from '@/lib/board-utils';

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.boardId;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const boards = useBoards();

  const currentBoard = boards.find((b) => b.id === boardId);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#F6F7FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4C5FD5] border-t-transparent" />
          <p className="text-[13px] font-medium text-[#6B7280]">Loading board…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-[#F6F7FB]">
      <BoardHeader
        boardName={currentBoard?.name ?? 'Board'}
        accent={currentBoard?.accent ?? '#4C5FD5'}
        members={currentBoard?.members ?? [{ initials: 'JD', color: '#4C5FD5' }]}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-hidden">
          <KanbanBoard boardId={boardId} />
        </div>
      </div>
    </main>
  );
}
