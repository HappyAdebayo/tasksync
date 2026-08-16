'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BoardsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ws = searchParams.get('workspace');

  useEffect(() => {
    if (ws) {
      router.replace(`/dashboard/workspaces?workspace=${ws}`);
    } else {
      router.replace('/dashboard/workspaces');
    }
  }, [router, ws]);

  return (
    <main className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4C5FD5] border-t-transparent" />
    </main>
  );
}
