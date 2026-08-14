'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import WorkspacesSection from '@/components/WorkspacesSection';
import BoardsSection from '@/components/BoardSection';
import ProjectView from '@/components/ProjectView';

export default function Home() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);

  return (
    <main className="flex h-screen flex-col bg-[#F6F7FB]">
      <Navbar />

      <div className="flex-1 overflow-y-auto">
        {boardId ? (
          <ProjectView boardId={boardId} onBack={() => setBoardId(null)} />
        ) : workspaceId ? (
          <BoardsSection
            workspaceId={workspaceId}
            onBack={() => setWorkspaceId(null)}
            onSelectBoard={setBoardId}
          />
        ) : (
          <WorkspacesSection onSelectWorkspace={setWorkspaceId} />
        )}
      </div>
    </main>
  );
}
