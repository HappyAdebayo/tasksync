
import BoardHeader from '@/components/BoardHeader';
import KanbanBoard from '@/components/KanbanBoard';

// In a real app, fetch this by params.boardId instead of hardcoding it.
const board = {
  name: 'Work',
  accent: '#4C5FD5',
  members: [
    { initials: 'JD', color: '#4C5FD5' },
    { initials: 'AM', color: '#17C3B2' },
    { initials: 'RK', color: '#E8A33D' },
  ],
};

export default function BoardPage() {
  return (
    <main className="flex h-screen flex-col bg-[#F6F7FB]">
      <BoardHeader boardName={board.name} accent={board.accent} members={board.members} />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-hidden">
          <KanbanBoard />
        </div>
      </div>
    </main>
  );
}
