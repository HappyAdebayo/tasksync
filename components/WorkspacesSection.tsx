'use client';

import { useState } from 'react';
import { Plus, ChevronRight, Folder, Trash2 } from 'lucide-react';
import { useWorkspaces, deleteWorkspace } from '@/lib/workspaces';
import { useBoards } from '@/lib/board-utils';
import NewWorkspaceModal from './NewWorkspaceModal';

export default function WorkspacesSection({
  onSelectWorkspace,
}: {
  onSelectWorkspace: (workspaceId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const workspaces = useWorkspaces();
  const boards = useBoards();

  const handleDeleteClick = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    if (pendingDeleteId === workspaceId) {
      deleteWorkspace(workspaceId);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(workspaceId);
    }
  };

  return (
    <section className="px-7 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[19px] font-semibold text-[#171A21]">Workspaces</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">Pick a workspace to see its boards.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#4C5FD5] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
        >
          <Plus className="h-4 w-4" />
          New Workspace
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
        {workspaces.map((workspace) => {
          const count = boards.filter((b) => b.workspaceId === workspace.id).length;
          const isPendingDelete = pendingDeleteId === workspace.id;

          return (
            <div
              key={workspace.id}
              className="group relative flex flex-col items-start gap-3 rounded-2xl border border-[#E3E5EC] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#D3D7E3] hover:shadow-[0_8px_20px_rgba(23,26,33,0.08)]"
            >
              <button
                onClick={() => onSelectWorkspace(workspace.id)}
                className="flex w-full flex-col items-start gap-3 text-left"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${workspace.accent}1A`, color: workspace.accent }}
                >
                  <Folder className="h-5 w-5" />
                </span>
                <div className="flex w-full items-center justify-between gap-2">
                  <div>
                    <p className="text-[14.5px] font-semibold text-[#171A21]">{workspace.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                      {count} {count === 1 ? 'board' : 'boards'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#B0B4C0] transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>

              <button
                onClick={(e) => handleDeleteClick(e, workspace.id)}
                onBlur={() => setPendingDeleteId(null)}
                className={`absolute right-3 top-3 flex h-7 items-center gap-1 rounded-full px-2 text-[11.5px] font-medium transition-all ${
                  isPendingDelete
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-[#B0B4C0] opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100'
                }`}
                title={isPendingDelete ? 'Click again to confirm' : 'Delete workspace'}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isPendingDelete && 'Confirm'}
              </button>
            </div>
          );
        })}
      </div>

      <NewWorkspaceModal open={open} onClose={() => setOpen(false)} onCreated={onSelectWorkspace} />
    </section>
  );
}