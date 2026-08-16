'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Folder,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
  Kanban,
  Shield,
  Eye,
} from 'lucide-react';
import { useWorkspaces, deleteWorkspace, type Workspace } from '@/lib/workspaces';
import { useBoards, deleteBoard, type Board } from '@/lib/board-utils';
import NewBoardModal from '@/components/NewBoardModal';
import NewWorkspaceModal from '@/components/NewWorkspaceModal';
import InviteModal from '@/components/InviteModal';

function AvatarStack({ members }: { members: NonNullable<Board['members']> }) {
  return (
    <div className="flex items-center">
      {members.slice(0, 4).map((m, i) => (
        <span
          key={m.initials + i}
          style={{ backgroundColor: m.color, zIndex: members.length - i }}
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-xs ${
            i > 0 ? '-ml-1.5' : ''
          }`}
        >
          {m.initials}
        </span>
      ))}
      {members.length > 4 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#E3E5EC] text-[9.5px] font-bold text-[#6B7280] -ml-1.5">
          +{members.length - 4}
        </span>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role?: string }) {
  if (role === 'owner') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
        <Shield className="h-3 w-3" /> Owner
      </span>
    );
  }
  if (role === 'editor') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
        Editor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
      <Eye className="h-3 w-3" /> Viewer (Read only)
    </span>
  );
}

function WorkspacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceParam = searchParams.get('workspace');

  const workspaces = useWorkspaces();
  const boards = useBoards();

  const [selectedWsId, setSelectedWsId] = useState<string | null>(workspaceParam);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [pendingDeleteWsId, setPendingDeleteWsId] = useState<string | null>(null);
  const [pendingDeleteBoardId, setPendingDeleteBoardId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeWorkspace = useMemo(() => {
    if (!selectedWsId) return null;
    return workspaces.find((w) => w.id === selectedWsId) || null;
  }, [selectedWsId, workspaces]);

  const workspaceBoards = useMemo(() => {
    if (!activeWorkspace) return [];
    return boards.filter((b) => b.workspaceId === activeWorkspace.id);
  }, [boards, activeWorkspace]);

  const canEdit = activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'editor';

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (pendingDeleteWsId === id) {
      try {
        await deleteWorkspace(id);
        if (selectedWsId === id) {
          setSelectedWsId(null);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to delete workspace.');
      }
      setPendingDeleteWsId(null);
    } else {
      setPendingDeleteWsId(id);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (pendingDeleteBoardId === id) {
      try {
        await deleteBoard(id);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to delete board.');
      }
      setPendingDeleteBoardId(null);
    } else {
      setPendingDeleteBoardId(id);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8">
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-[13.5px] font-medium text-[#C4453D] border border-red-200">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-3 font-bold hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: A specific Workspace is open -> show its Boards */}
      {activeWorkspace ? (
        <div>
          {/* Simple Back button */}
          <button
            onClick={() => setSelectedWsId(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#4C5FD5]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Workspaces
          </button>

          {/* Workspace Title & Actions */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${activeWorkspace.accent}1A`, color: activeWorkspace.accent }}
              >
                <Folder className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold text-[#171A21] tracking-tight">
                    {activeWorkspace.name}
                  </h1>
                  <RoleBadge role={activeWorkspace.role} />
                </div>
                <p className="text-[13px] text-[#6B7280]">
                  {workspaceBoards.length} {workspaceBoards.length === 1 ? 'board' : 'boards'} in this workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {activeWorkspace.role === 'owner' && (
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E3E5EC] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#171A21] shadow-xs hover:border-[#4C5FD5] hover:text-[#4C5FD5] transition-all"
                >
                  <Users className="h-4 w-4" />
                  Invite Members
                </button>
              )}

              {canEdit ? (
                <button
                  onClick={() => setBoardModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#4C5FD5] px-4 py-2 text-[13px] font-semibold text-white shadow-xs transition-all hover:bg-[#3E4EC0]"
                >
                  <Plus className="h-4 w-4" />
                  New Board
                </button>
              ) : (
                <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700 border border-amber-200 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> View Only Access
                </span>
              )}
            </div>
          </div>

          {/* Boards Grid */}
          {workspaceBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D3D7E3] bg-white px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0FD] text-[#4C5FD5]">
                <Kanban className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-[#171A21]">No boards yet</h3>
              <p className="mt-1 text-[13px] text-[#6B7280] max-w-sm">
                {canEdit
                  ? `Create the first Kanban board in "${activeWorkspace.name}" to start tracking tasks.`
                  : `There are currently no boards in "${activeWorkspace.name}".`}
              </p>
              {canEdit && (
                <button
                  onClick={() => setBoardModalOpen(true)}
                  className="mt-5 flex items-center gap-1.5 rounded-xl bg-[#4C5FD5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#3E4EC0] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Board
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaceBoards.map((board) => {
                const isPendingDelete = pendingDeleteBoardId === board.id;

                return (
                  <div
                    key={board.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E3E5EC] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#4C5FD5]/40 hover:shadow-md"
                  >
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: board.accent || '#4C5FD5' }}
                    />

                    <Link
                      href={`/dashboard/boards/${board.id}`}
                      className="flex flex-1 flex-col p-5 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-[family-name:var(--font-display)] text-[16px] font-bold text-[#171A21] group-hover:text-[#4C5FD5] transition-colors">
                          {board.name}
                        </h3>
                        <span className="text-[12px] font-medium text-[#8E95A5]">
                          {board.listCount ?? 0} {board.listCount === 1 ? 'list' : 'lists'}
                        </span>
                      </div>

                      {board.description && (
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] text-[#6B7280]">
                          {board.description}
                        </p>
                      )}

                      <div className="mt-6 flex items-center justify-between border-t border-[#F0F2F7] pt-3.5">
                        {board.members && board.members.length > 0 ? (
                          <AvatarStack members={board.members} />
                        ) : (
                          <span className="text-[11.5px] text-[#8E95A5]">1 member</span>
                        )}

                        <span className="flex items-center gap-1 text-[12px] font-semibold text-[#4C5FD5] group-hover:translate-x-0.5 transition-transform">
                          Open Board <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>

                    {/* Delete button only for owner/editor */}
                    {canEdit && (
                      <button
                        onClick={(e) => handleDeleteBoard(e, board.id)}
                        onBlur={() => setPendingDeleteBoardId(null)}
                        className={`absolute right-3 top-4 flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-all ${
                          isPendingDelete
                            ? 'bg-red-500 text-white z-10'
                            : 'text-[#B0B4C0] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                        }`}
                        title={isPendingDelete ? 'Confirm delete' : 'Delete board'}
                      >
                        <Trash2 className="h-3 w-3" />
                        {isPendingDelete && 'Confirm'}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Board Card only for owner/editor */}
              {canEdit && (
                <button
                  onClick={() => setBoardModalOpen(true)}
                  className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D3D7E3] bg-[#FAFAFC] p-5 text-center transition-all hover:border-[#4C5FD5] hover:bg-white group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#E3E5EC] text-[#6B7280] shadow-xs group-hover:border-[#4C5FD5] group-hover:text-[#4C5FD5] group-hover:scale-110 transition-all">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span className="mt-2 text-[13.5px] font-semibold text-[#171A21]">Create Board</span>
                  <span className="text-[11.5px] text-[#8E95A5]">Add another Kanban board</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Root Workspaces view */
        <div>
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold text-[#171A21] tracking-tight">
                Workspaces
              </h1>
              <p className="mt-0.5 text-[13.5px] text-[#6B7280]">
                Select a workspace to view its boards, or create a new one.
              </p>
            </div>

            <button
              onClick={() => setWsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#4C5FD5] px-4 py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:bg-[#3E4EC0]"
            >
              <Plus className="h-4 w-4" />
              New Workspace
            </button>
          </div>

          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => {
              const wsBoards = boards.filter((b) => b.workspaceId === ws.id);
              const isPendingDelete = pendingDeleteWsId === ws.id;
              const isOwner = ws.role === 'owner';

              return (
                <div
                  key={ws.id}
                  onClick={() => setSelectedWsId(ws.id)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[#E3E5EC] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#4C5FD5]/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${ws.accent}1A`, color: ws.accent }}
                      >
                        <Folder className="h-5 w-5" />
                      </span>

                      <div className="flex items-center gap-2">
                        <RoleBadge role={ws.role} />
                        {isOwner && (
                          <button
                            onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                            onBlur={() => setPendingDeleteWsId(null)}
                            className={`flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-all ${
                              isPendingDelete
                                ? 'bg-red-500 text-white'
                                : 'text-[#B0B4C0] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                            }`}
                            title={isPendingDelete ? 'Confirm delete' : 'Delete workspace'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isPendingDelete && 'Confirm'}
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-[17px] font-bold text-[#171A21] group-hover:text-[#4C5FD5] transition-colors">
                      {ws.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      {wsBoards.length} {wsBoards.length === 1 ? 'board' : 'boards'}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F0F2F7] pt-3.5 text-[12.5px] font-semibold text-[#4C5FD5]">
                    <span>View Boards</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}

            {/* Create Workspace Card */}
            <button
              onClick={() => setWsModalOpen(true)}
              className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D3D7E3] bg-[#FAFAFC] p-5 text-center transition-all hover:border-[#4C5FD5] hover:bg-white group"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E3E5EC] text-[#6B7280] shadow-xs group-hover:border-[#4C5FD5] group-hover:text-[#4C5FD5] group-hover:scale-110 transition-all">
                <Plus className="h-5 w-5" />
              </span>
              <span className="mt-2.5 text-[14px] font-semibold text-[#171A21]">Create Workspace</span>
              <span className="text-[12px] text-[#8E95A5]">Add a team space</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewWorkspaceModal
        open={wsModalOpen}
        onClose={() => setWsModalOpen(false)}
        onCreated={(id) => setSelectedWsId(id)}
      />

      <NewBoardModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        defaultWorkspaceId={activeWorkspace?.id}
        onCreated={(id) => router.push(`/dashboard/boards/${id}`)}
      />

      {activeWorkspace && (
        <InviteModal
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </main>
  );
}

export default function WorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4C5FD5] border-t-transparent" />
        </div>
      }
    >
      <WorkspacesContent />
    </Suspense>
  );
}
