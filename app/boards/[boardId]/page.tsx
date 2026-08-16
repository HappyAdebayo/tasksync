'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function BoardRedirectPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/boards/${resolvedParams.boardId}`);
  }, [router, resolvedParams.boardId]);

  return (
    <main className="flex h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4C5FD5] border-t-transparent" />
        <p className="text-[13px] font-medium text-[#667085]">Redirecting to board…</p>
      </div>
    </main>
  );
}
