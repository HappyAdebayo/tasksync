'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import WorkspacesSection from '@/components/WorkspacesSection';
import BoardsSection from '@/components/BoardSection';
import ProjectView from '@/components/ProjectView';
import { getAuthToken } from '@/lib/api';
import { useTokenRefresh } from '@/lib/useTokenRefresh';

export default function Home() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Silently refresh the access token every 12 minutes
  useTokenRefresh();

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
          <p className="text-[13px] font-medium text-[#6B7280]">Loading dashboard…</p>
        </div>
      </main>
    );
  }

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
