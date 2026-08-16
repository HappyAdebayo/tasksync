'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Folder,
  Plus,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Bell,
  CheckCircle2,
  Users,
  ChevronRight,
  Trash2,
  ExternalLink,
  Kanban,
  Activity,
  Layers,
} from 'lucide-react';
import { useWorkspaces, deleteWorkspace, type Workspace } from '@/lib/workspaces';
import { useBoards, deleteBoard, type Board } from '@/lib/board-utils';
import { useNotifications, respondToInvite } from '@/lib/invites';
import { getStoredUser } from '@/lib/api';
import { useSocket } from '@/lib/socket';
import NewWorkspaceModal from '@/components/NewWorkspaceModal';
import NewBoardModal from '@/components/NewBoardModal';
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

export default function DashboardOverviewPage() {
  const router = useRouter();
  const workspaces = useWorkspaces();
  const boards = useBoards();
  const notifications = useNotifications();
  const { isConnected } = useSocket();

  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedWorkspaceForInvite, setSelectedWorkspaceForInvite] = useState<Workspace | null>(null);
  const [pendingDeleteWsId, setPendingDeleteWsId] = useState<string | null>(null);
  const [pendingDeleteBoardId, setPendingDeleteBoardId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const pendingInvites = notifications.filter(
    (n) => n.invitationToken && n.invitationStatus === 'pending'
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (pendingDeleteWsId === id) {
      try {
        await deleteWorkspace(id);
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

  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-[13.5px] font-medium text-[#C4453D] border border-red-200">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-3 font-bold hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#E3E5EC] bg-gradient-to-br from-white via-white to-[#EEF0FD]/40 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF0FD] px-3 py-1 text-[12px] font-semibold text-[#4C5FD5]">
                <Sparkles className="h-3.5 w-3.5" /> Workspace Overview
              </span>
              <span className="text-[12.5px] text-[#8E95A5]">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] font-bold text-[#171A21] tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280] max-w-xl">
              Keep your team aligned and tasks moving across your workspaces and boards in real time.
            </p>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setWorkspaceModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#E3E5EC] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#171A21] shadow-xs transition-all hover:border-[#4C5FD5] hover:text-[#4C5FD5] hover:shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Workspace
            </button>
            <button
              onClick={() => setBoardModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#4C5FD5] px-4 py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:bg-[#3E4EC0] hover:shadow-md hover:shadow-[#4C5FD5]/25"
            >
              <Plus className="h-4 w-4" />
              New Board
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="flex flex-col rounded-2xl border border-[#E3E5EC] bg-white p-4 transition-all hover:border-[#D3D7E3]">
            <div className="flex items-center justify-between text-[#8E95A5]">
              <span className="text-[12px] font-medium">Workspaces</span>
              <Layers className="h-4 w-4 text-[#4C5FD5]" />
            </div>
            <span className="mt-2 text-[24px] font-bold text-[#171A21]">{workspaces.length}</span>
            <span className="text-[11.5px] text-[#8E95A5]">Active team spaces</span>
          </div>

          <div className="flex flex-col rounded-2xl border border-[#E3E5EC] bg-white p-4 transition-all hover:border-[#D3D7E3]">
            <div className="flex items-center justify-between text-[#8E95A5]">
              <span className="text-[12px] font-medium">Total Boards</span>
              <Kanban className="h-4 w-4 text-[#17C3B2]" />
            </div>
            <span className="mt-2 text-[24px] font-bold text-[#171A21]">{boards.length}</span>
            <span className="text-[11.5px] text-[#8E95A5]">Kanban boards active</span>
          </div>

          <Link
            href="/dashboard/notifications"
            className="flex flex-col rounded-2xl border border-[#E3E5EC] bg-white p-4 transition-all hover:border-[#4C5FD5] hover:shadow-xs group"
          >
            <div className="flex items-center justify-between text-[#8E95A5]">
              <span className="text-[12px] font-medium">Notifications</span>
              <Bell className="h-4 w-4 text-[#E8A33D] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-[#171A21]">{notifications.length}</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-[#C4453D]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <span className="text-[11.5px] text-[#4C5FD5] flex items-center gap-1 mt-auto">
              View center <ArrowRight className="h-3 w-3" />
            </span>
          </Link>

          <div className="flex flex-col rounded-2xl border border-[#E3E5EC] bg-white p-4 transition-all hover:border-[#D3D7E3]">
            <div className="flex items-center justify-between text-[#8E95A5]">
              <span className="text-[12px] font-medium">Real-time Sync</span>
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[16px] font-bold text-[#171A21]">
                {isConnected ? 'Connected' : 'Connecting'}
              </span>
            </div>
            <span className="text-[11.5px] text-[#8E95A5]">WebSocket Gateway</span>
          </div>
        </div>
      </section>

      {/* Pending Invitations Alert Card */}
      {pendingInvites.length > 0 && (
        <section className="mb-8 rounded-2xl border border-indigo-100 bg-[#F4F6FE] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4C5FD5] text-white">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-[14.5px] font-semibold text-[#171A21]">
                  Pending Workspace Invitations ({pendingInvites.length})
                </h3>
                <p className="text-[12px] text-[#6B7280]">
                  You have been invited to collaborate on these workspaces.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/notifications"
              className="text-[12.5px] font-medium text-[#4C5FD5] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col justify-between rounded-xl border border-[#E3E5EC] bg-white p-4 shadow-xs"
              >
                <div>
                  <p className="text-[13.5px] font-semibold text-[#171A21]">{invite.title}</p>
                  <p className="mt-1 text-[12.5px] text-[#6B7280]">{invite.message}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => respondToInvite(invite.id, invite.invitationToken!, 'accept')}
                    className="flex-1 rounded-lg bg-[#4C5FD5] py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#3E4EC0]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToInvite(invite.id, invite.invitationToken!, 'decline')}
                    className="flex-1 rounded-lg border border-[#E3E5EC] py-1.5 text-[12px] font-semibold text-[#6B7280] transition-colors hover:border-[#C4453D] hover:text-[#C4453D]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid: Workspaces and Recent Boards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Workspaces Section (2 Cols) */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[18px] font-bold text-[#171A21]">
                Workspaces
              </h2>
              <p className="text-[12.5px] text-[#6B7280]">Select a workspace to manage its boards.</p>
            </div>
            <Link
              href="/dashboard/workspaces"
              className="flex items-center gap-1 text-[12.5px] font-medium text-[#4C5FD5] hover:underline"
            >
              Explore all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {workspaces.slice(0, 3).map((ws) => {
              const wsBoards = boards.filter((b) => b.workspaceId === ws.id);
              const isPendingDelete = pendingDeleteWsId === ws.id;

              return (
                <div
                  key={ws.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#E3E5EC] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4C5FD5]/40 hover:shadow-md"
                >
                  <Link href={`/dashboard/workspaces?workspace=${ws.id}`} className="flex-1">
                    <div className="flex items-start justify-between">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${ws.accent}1A`, color: ws.accent }}
                      >
                        <Folder className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-[family-name:var(--font-display)] text-[15.5px] font-bold text-[#171A21] group-hover:text-[#4C5FD5] transition-colors">
                        {ws.name}
                      </h3>
                      <p className="mt-1 text-[12.5px] text-[#6B7280]">
                        {wsBoards.length} {wsBoards.length === 1 ? 'board' : 'boards'} available
                      </p>
                    </div>
                  </Link>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F0F2F7] pt-3">
                    <button
                      onClick={() => {
                        setSelectedWorkspaceForInvite(ws);
                        setInviteModalOpen(true);
                      }}
                      className="text-[12px] font-medium text-[#6B7280] hover:text-[#4C5FD5] flex items-center gap-1"
                    >
                      <Users className="h-3.5 w-3.5" /> Invite
                    </button>

                    <button
                      onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                      onBlur={() => setPendingDeleteWsId(null)}
                      className={`flex h-7 items-center gap-1 rounded-full px-2 text-[11.5px] font-medium transition-all ${
                        isPendingDelete
                          ? 'bg-red-500 text-white'
                          : 'text-[#B0B4C0] hover:bg-red-50 hover:text-red-500'
                      }`}
                      title={isPendingDelete ? 'Click again to confirm delete' : 'Delete workspace'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isPendingDelete && 'Confirm'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Workspace Card */}
            <button
              onClick={() => setWorkspaceModalOpen(true)}
              className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D3D7E3] bg-[#FAFAFC] p-5 text-center transition-all hover:border-[#4C5FD5] hover:bg-white group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#E3E5EC] text-[#6B7280] shadow-xs group-hover:border-[#4C5FD5] group-hover:text-[#4C5FD5] group-hover:scale-110 transition-all">
                <Plus className="h-4 w-4" />
              </span>
              <span className="mt-2 text-[13.5px] font-semibold text-[#171A21]">Create Workspace</span>
              <span className="text-[11.5px] text-[#8E95A5]">Organize projects for your team</span>
            </button>
          </div>
        </section>

        {/* Recent Boards / Quick Access (1 Col) */}
        <section className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[18px] font-bold text-[#171A21]">
                Quick Boards
              </h2>
              <p className="text-[12.5px] text-[#6B7280]">Jump straight to a board</p>
            </div>
            <Link
              href="/dashboard/boards"
              className="text-[12.5px] font-medium text-[#4C5FD5] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {boards.slice(0, 5).map((board) => {
              const ws = workspaces.find((w) => w.id === board.workspaceId);
              const isPendingDelete = pendingDeleteBoardId === board.id;

              return (
                <div
                  key={board.id}
                  className="group relative flex items-center justify-between rounded-2xl border border-[#E3E5EC] bg-white p-4 transition-all duration-150 hover:border-[#4C5FD5]/40 hover:shadow-xs"
                >
                  <Link
                    href={`/dashboard/boards/${board.id}`}
                    className="flex flex-1 items-center gap-3 min-w-0"
                  >
                    <span
                      className="h-9 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: board.accent }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[14px] text-[#171A21] truncate group-hover:text-[#4C5FD5] transition-colors">
                        {board.name}
                      </h4>
                      <p className="text-[11.5px] text-[#8E95A5] truncate">
                        {ws?.name || 'Workspace'} &middot; {board.listCount ?? 0} lists
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    {board.members && board.members.length > 0 && (
                      <AvatarStack members={board.members} />
                    )}

                    <button
                      onClick={(e) => handleDeleteBoard(e, board.id)}
                      onBlur={() => setPendingDeleteBoardId(null)}
                      className={`flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-all ${
                        isPendingDelete
                          ? 'bg-red-500 text-white'
                          : 'text-[#B0B4C0] opacity-0 group-hover:opacity-100 hover:text-red-500'
                      }`}
                      title={isPendingDelete ? 'Confirm delete' : 'Delete board'}
                    >
                      <Trash2 className="h-3 w-3" />
                      {isPendingDelete && 'Confirm'}
                    </button>
                  </div>
                </div>
              );
            })}

            {boards.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D3D7E3] bg-[#FAFAFC] p-8 text-center">
                <Kanban className="h-7 w-7 text-[#B0B4C0]" />
                <p className="mt-2 text-[13px] font-semibold text-[#171A21]">No boards yet</p>
                <p className="text-[12px] text-[#8E95A5]">Create your first board to get started.</p>
                <button
                  onClick={() => setBoardModalOpen(true)}
                  className="mt-3 rounded-lg bg-[#4C5FD5] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#3E4EC0]"
                >
                  Create Board
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <NewWorkspaceModal
        open={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        onCreated={(id) => router.push(`/dashboard/workspaces?workspace=${id}`)}
      />

      <NewBoardModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        onCreated={(id) => router.push(`/dashboard/boards/${id}`)}
      />

      {selectedWorkspaceForInvite && (
        <InviteModal
          workspaceId={selectedWorkspaceForInvite.id}
          workspaceName={selectedWorkspaceForInvite.name}
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedWorkspaceForInvite(null);
          }}
        />
      )}
    </main>
  );
}
