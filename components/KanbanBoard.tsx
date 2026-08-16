'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, MoreVertical, Calendar, X, GripVertical, Trash2, MousePointer, Eye } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type CardItem, type ListItem, formatDueDate, dueDateTone, findContainer } from '@/lib/board-utils';
import {
  fetchBoardDetailsApi,
  createBoardListApi,
  updateBoardListApi,
  deleteBoardListApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  getStoredUser,
} from '@/lib/api';
import { useSocket } from '@/lib/socket';

const initialLists: ListItem[] = [];

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

type RemoteDragState = {
  clientId: string;
  boardId: string;
  cardId: string;
  cardTitle: string;
  user: { name: string; color: string; initials: string };
  x: number;
  y: number;
  isDragging: boolean;
};

/* ---------- Card ---------- */

function CardBody({ card }: { card: CardItem }) {
  return (
    <>
      <p className="text-[13.5px] leading-snug text-[#101828]">{card.title}</p>
      {card.dueDate && (
        <span
          className={`mt-2.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${dueDateTone(
            card.dueDate
          )}`}
        >
          <Calendar className="h-3 w-3" />
          {formatDueDate(card.dueDate)}
        </span>
      )}
    </>
  );
}

function SortableCard({
  card,
  onDelete,
  isRemoteBeingDragged,
  readOnly,
}: {
  card: CardItem;
  onDelete: (cardId: string) => void;
  isRemoteBeingDragged?: boolean;
  readOnly?: boolean;
}) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (pendingDelete) {
      onDelete(card.id);
    } else {
      setPendingDelete(true);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(readOnly ? {} : attributes)}
      {...(readOnly ? {} : listeners)}
      className={`group relative rounded-xl border bg-white p-3.5 transition-all ${
        readOnly ? 'cursor-default pr-3.5' : 'cursor-grab pr-7 active:cursor-grabbing'
      } ${
        isDragging
          ? 'opacity-30 border-[#4C5FD5]'
          : isRemoteBeingDragged
          ? 'opacity-40 border-dashed border-indigo-400 bg-indigo-50/50'
          : 'border-[#EAECF0] shadow-[0_1px_2px_rgba(23,26,33,0.04)] hover:border-[#D0D5DD] hover:shadow-[0_6px_16px_rgba(23,26,33,0.08)]'
      }`}
    >
      {!readOnly && (
        <>
          <GripVertical className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D0D5DD] opacity-0 transition-opacity group-hover:opacity-100" />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDeleteClick}
            onBlur={() => setPendingDelete(false)}
            aria-label="Delete card"
            title={pendingDelete ? 'Click again to confirm' : 'Delete card'}
            className={`absolute right-2 top-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors ${
              pendingDelete
                ? 'bg-red-500 text-white opacity-100'
                : 'text-[#D0D5DD] opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100'
            }`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </>
      )}
      <CardBody card={card} />
    </div>
  );
}

/* ---------- Add card / add list forms ---------- */

function AddCardForm({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue('');
  }

  return (
    <div className="rounded-xl border border-[#4C5FD5] bg-white p-2 shadow-[0_2px_8px_rgba(76,95,213,0.12)]">
      <textarea
        autoFocus
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Enter a title for this card…"
        className="w-full resize-none border-none text-[13.5px] text-[#101828] outline-none placeholder:text-[#667085]"
      />
      <div className="mt-1 flex items-center gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-[#4C5FD5] px-3 py-1 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
        >
          Add card
        </button>
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-lg p-1 text-[#667085] transition-colors hover:bg-[#F9FAFB] hover:text-[#101828]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AddListColumn({
  onAdd,
  defaultColor,
}: {
  onAdd: (title: string, accent: string) => void;
  defaultColor: string;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [colorInput, setColorInput] = useState(defaultColor);
  const [invalidHex, setInvalidHex] = useState(false);

  useEffect(() => {
    setColorInput(defaultColor);
    setInvalidHex(false);
  }, [defaultColor, adding]);

  function handleColorChange(rawValue: string) {
    setColorInput(rawValue);
    const trimmed = rawValue.trim();
    if (!trimmed) {
      setInvalidHex(false);
    } else {
      setInvalidHex(!HEX_COLOR_PATTERN.test(trimmed));
    }
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const trimmedColor = colorInput.trim();
    const resolvedColor =
      trimmedColor && HEX_COLOR_PATTERN.test(trimmedColor) ? trimmedColor : defaultColor;

    onAdd(trimmed, resolvedColor);
    setTitle('');
    setColorInput(defaultColor);
    setInvalidHex(false);
    setAdding(false);
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex h-[44px] w-[260px] flex-shrink-0 items-center gap-2 rounded-2xl border border-dashed border-[#D0D5DD] bg-white/60 px-4 text-[13.5px] font-medium text-[#667085] transition-colors hover:border-[#4C5FD5] hover:bg-white hover:text-[#4C5FD5]"
      >
        <Plus className="h-4 w-4" />
        Add another list
      </button>
    );
  }

  return (
    <div className="flex w-[260px] flex-shrink-0 flex-col gap-2 rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-3 shadow-xs">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setAdding(false);
        }}
        placeholder="Enter list title…"
        className="rounded-lg border border-[#EAECF0] bg-white px-2.5 py-1.5 text-[13.5px] text-[#101828] outline-none placeholder:text-[#667085] focus:border-[#4C5FD5]"
      />

      <div className="flex flex-col gap-1">
        <label className="text-[11.5px] font-medium text-[#667085]">
          List color <span className="font-normal text-[#98A2B3]">(hex code)</span>
        </label>
        <div className="flex items-center gap-2">
          <span
            className="h-6 w-6 flex-shrink-0 rounded-md border border-[#EAECF0] shadow-xs"
            style={{
              backgroundColor:
                !invalidHex && colorInput.trim() ? colorInput.trim() : defaultColor,
            }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={colorInput}
            onChange={(e) => handleColorChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="#4C5FD5"
            maxLength={7}
            className={`w-full rounded-lg border bg-white px-2.5 py-1 text-[12.5px] font-mono text-[#101828] outline-none transition-colors ${
              invalidHex
                ? 'border-red-400 focus:border-red-500'
                : 'border-[#EAECF0] focus:border-[#4C5FD5]'
            }`}
          />
        </div>
        {invalidHex && (
          <p className="text-[11px] text-red-500">Enter a valid hex code like #4C5FD5</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={submit}
          disabled={invalidHex}
          className="rounded-lg bg-[#4C5FD5] px-3 py-1 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add list
        </button>
        <button
          onClick={() => {
            setAdding(false);
            setInvalidHex(false);
          }}
          aria-label="Cancel"
          className="rounded-lg p-1 text-[#667085] transition-colors hover:bg-white hover:text-[#101828]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Column ---------- */

function ListColumn({
  list,
  onAddCard,
  onDeleteCard,
  onRenameList,
  onDeleteList,
  remoteDraggedCardIds,
  readOnly,
}: {
  list: ListItem;
  onAddCard: (listId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameList: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
  remoteDraggedCardIds: Set<string>;
  readOnly?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [menuOpen, setMenuOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: { type: 'container' },
    disabled: readOnly,
  });

  const cardIds = list.cards.map((c) => c.id);

  function submitRename() {
    if (readOnly) return;
    const trimmed = title.trim();
    if (trimmed && trimmed !== list.title) {
      onRenameList(list.id, trimmed);
    } else {
      setTitle(list.title);
    }
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      className="flex w-[260px] flex-shrink-0 flex-col rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] shadow-xs"
    >
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: list.accent }}
            aria-hidden="true"
          />
          {editing && !readOnly ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') {
                  setTitle(list.title);
                  setEditing(false);
                }
              }}
              className="w-full rounded border border-[#4C5FD5] bg-white px-1.5 py-0.5 text-[13.5px] font-semibold text-[#101828] outline-none"
            />
          ) : (
            <button
              onClick={() => {
                if (!readOnly) setEditing(true);
              }}
              className={`truncate text-left font-[family-name:var(--font-display)] text-[14px] font-semibold text-[#101828] ${
                readOnly ? 'cursor-default' : 'hover:text-[#4C5FD5]'
              }`}
            >
              {list.title}
            </button>
          )}
          <span className="flex-shrink-0 rounded-full bg-white px-2 py-0.5 text-[11.5px] font-medium text-[#667085] shadow-xs">
            {list.cards.length}
          </span>
        </div>

        {!readOnly && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={`List options for ${list.title}`}
              aria-expanded={menuOpen}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-white hover:text-[#101828]"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-[#EAECF0] bg-white p-1 shadow-lg"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditing(true);
                  }}
                  className="flex w-full rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-[#101828] hover:bg-[#F9FAFB]"
                >
                  Rename
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteList(list.id);
                  }}
                  className="flex w-full rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-[#C4453D] hover:bg-red-50"
                >
                  Delete list
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-1">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[10px]">
            {list.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onDelete={onDeleteCard}
                isRemoteBeingDragged={remoteDraggedCardIds.has(card.id)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {!readOnly && (
        <div className="p-2.5 pt-1.5">
          {adding ? (
            <AddCardForm
              onAdd={(title) => {
                onAddCard(list.id, title);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-[#667085] transition-colors hover:bg-white hover:text-[#101828]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add card
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Board ---------- */

const LIST_COLOR_PALETTE = ['#4C5FD5', '#17C3B2', '#E8A33D', '#C4453D', '#8A5CF6'];

export default function KanbanBoard({
  boardId,
  readOnly = false,
}: {
  boardId?: string;
  readOnly?: boolean;
}) {
  const [lists, setLists] = useState<ListItem[]>(initialLists);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [remoteDrags, setRemoteDrags] = useState<Record<string, RemoteDragState>>({});
  const { socket } = useSocket();

  // Pointer drag throttling ref
  const lastDragEmitRef = useRef<number>(0);

  // Debounced queue timers for 3-second sync
  const pendingTaskUpdates = useRef<Map<string, { boardListId?: string; position?: number; name?: string }>>(new Map());
  const pendingListUpdates = useRef<Map<string, { name?: string }>>(new Map());
  const taskTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const listTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const nextDefaultColor = LIST_COLOR_PALETTE[lists.length % LIST_COLOR_PALETTE.length];

  const loadBoardLists = useCallback(async () => {
    if (!boardId) return;
    try {
      const remoteLists = await fetchBoardDetailsApi(boardId);
      if (Array.isArray(remoteLists)) {
        const mapped: ListItem[] = remoteLists.map((item: any, index: number) => ({
          id: item.id,
          title: item.name,
          accent: item.color || LIST_COLOR_PALETTE[index % LIST_COLOR_PALETTE.length],
          cards: Array.isArray(item.tasks)
            ? item.tasks.map((t: any) => ({
                id: t.id,
                title: t.name,
              }))
            : [],
        }));
        setLists(mapped);
      }
    } catch {
      // Fallback
    }
  }, [boardId]);

  // Load board data on mount/boardId change
  useEffect(() => {
    loadBoardLists();
  }, [loadBoardLists]);

  // Realtime WebSocket Room & Event Subscriptions
  useEffect(() => {
    if (!socket || !boardId) return;

    socket.emit('join-board', { boardId });

    const handleRemoteDragPointer = (data: RemoteDragState) => {
      if (data?.boardId === boardId) {
        setRemoteDrags((prev) => ({
          ...prev,
          [data.clientId]: data,
        }));
      }
    };

    const handleRemoteDragEnd = (data: { clientId: string; boardId: string; lists?: ListItem[] }) => {
      if (data?.boardId === boardId) {
        setRemoteDrags((prev) => {
          const next = { ...prev };
          delete next[data.clientId];
          return next;
        });
        if (Array.isArray(data.lists)) {
          setLists(data.lists);
        }
      }
    };

    const handleCardMoved = (data: { boardId: string; lists: ListItem[] }) => {
      if (data?.boardId === boardId && Array.isArray(data?.lists)) {
        setLists(data.lists);
      }
    };

    const handleBoardUpdated = (data: { boardId: string; lists?: ListItem[] }) => {
      if (data?.boardId === boardId) {
        if (Array.isArray(data.lists)) {
          setLists(data.lists);
        } else {
          loadBoardLists();
        }
      }
    };

    socket.on('board:remote-drag-pointer', handleRemoteDragPointer);
    socket.on('board:remote-drag-end', handleRemoteDragEnd);
    socket.on('board:card-moved', handleCardMoved);
    socket.on('board:updated', handleBoardUpdated);

    return () => {
      socket.emit('leave-board', { boardId });
      socket.off('board:remote-drag-pointer', handleRemoteDragPointer);
      socket.off('board:remote-drag-end', handleRemoteDragEnd);
      socket.off('board:card-moved', handleCardMoved);
      socket.off('board:updated', handleBoardUpdated);
    };
  }, [socket, boardId, loadBoardLists]);

  // Live mouse movement listener while actively dragging to stream cursor coordinates to all other members
  useEffect(() => {
    if (readOnly || !activeCard || !socket || !boardId) return;

    const user = getStoredUser();
    const userName = user?.name || 'Teammate';
    const userInitials =
      userName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TM';

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastDragEmitRef.current > 30) {
        lastDragEmitRef.current = now;
        socket.emit('board:drag-pointer', {
          boardId,
          cardId: activeCard.id,
          cardTitle: activeCard.title,
          user: {
            name: userName,
            initials: userInitials,
            color: '#4C5FD5',
          },
          x: e.clientX,
          y: e.clientY,
          isDragging: true,
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [readOnly, activeCard, socket, boardId]);

  // 3-second debounced task update sync function
  const scheduleTaskSync = useCallback((taskId: string, payload: { boardListId?: string; position?: number; name?: string }) => {
    if (readOnly) return;
    const existing = pendingTaskUpdates.current.get(taskId) || {};
    pendingTaskUpdates.current.set(taskId, { ...existing, ...payload });

    const existingTimer = taskTimers.current.get(taskId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      const updatePayload = pendingTaskUpdates.current.get(taskId);
      if (updatePayload) {
        try {
          await updateTaskApi(taskId, updatePayload);
        } catch (err: any) {
          setErrorBanner(err?.message || 'Failed to sync task change to server.');
        }
        pendingTaskUpdates.current.delete(taskId);
        taskTimers.current.delete(taskId);
      }
    }, 3000);

    taskTimers.current.set(taskId, timer);
  }, [readOnly]);

  // 3-second debounced list update sync function
  const scheduleListSync = useCallback((listId: string, payload: { name?: string }) => {
    if (readOnly) return;
    const existing = pendingListUpdates.current.get(listId) || {};
    pendingListUpdates.current.set(listId, { ...existing, ...payload });

    const existingTimer = listTimers.current.get(listId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      const updatePayload = pendingListUpdates.current.get(listId);
      if (updatePayload) {
        try {
          await updateBoardListApi(listId, updatePayload);
        } catch (err: any) {
          setErrorBanner(err?.message || 'Failed to sync list change to server.');
        }
        pendingListUpdates.current.delete(listId);
        listTimers.current.delete(listId);
      }
    }, 3000);

    listTimers.current.set(listId, timer);
  }, [readOnly]);

  async function addCard(listId: string, title: string) {
    if (readOnly) return;
    const tempId = crypto.randomUUID();
    const nextLists = lists.map((list) =>
      list.id === listId
        ? { ...list, cards: [...list.cards, { id: tempId, title }] }
        : list
    );
    setLists(nextLists);

    if (socket && boardId) {
      socket.emit('board:change', { boardId, lists: nextLists });
    }

    try {
      const created = await createTaskApi({ name: title, boardListId: listId });
      if (created?.id) {
        setLists((prev) => {
          const updated = prev.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: list.cards.map((c) => (c.id === tempId ? { ...c, id: created.id } : c)),
                }
              : list
          );
          if (socket && boardId) {
            socket.emit('board:change', { boardId, lists: updated });
          }
          return updated;
        });
      }
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to save card to server.');
    }
  }

  async function deleteCard(cardId: string) {
    if (readOnly) return;
    const nextLists = lists.map((list) => ({
      ...list,
      cards: list.cards.filter((c) => c.id !== cardId),
    }));
    setLists(nextLists);

    if (socket && boardId) {
      socket.emit('board:change', { boardId, lists: nextLists });
    }

    try {
      await deleteTaskApi(cardId);
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to delete card on server.');
    }
  }

  async function addList(title: string, accent: string) {
    if (readOnly) return;
    const tempId = crypto.randomUUID();
    const nextLists = [...lists, { id: tempId, title, accent, cards: [] }];
    setLists(nextLists);

    if (socket && boardId) {
      socket.emit('board:change', { boardId, lists: nextLists });
    }

    if (boardId) {
      try {
        const created = await createBoardListApi({ name: title, color: accent, boardId });
        if (created?.id) {
          setLists((prev) => {
            const updated = prev.map((l) => (l.id === tempId ? { ...l, id: created.id } : l));
            if (socket && boardId) {
              socket.emit('board:change', { boardId, lists: updated });
            }
            return updated;
          });
        }
      } catch (err: any) {
        setErrorBanner(err?.message || 'Failed to save list to server.');
      }
    }
  }

  function renameList(listId: string, title: string) {
    if (readOnly) return;
    const nextLists = lists.map((list) => (list.id === listId ? { ...list, title } : list));
    setLists(nextLists);

    if (socket && boardId) {
      socket.emit('board:change', { boardId, lists: nextLists });
    }
    scheduleListSync(listId, { name: title });
  }

  async function deleteList(listId: string) {
    if (readOnly) return;
    const nextLists = lists.filter((list) => list.id !== listId);
    setLists(nextLists);

    if (socket && boardId) {
      socket.emit('board:change', { boardId, lists: nextLists });
    }

    try {
      await deleteBoardListApi(listId);
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to delete list on server.');
    }
  }

  function handleDragStart(event: DragStartEvent) {
    if (readOnly) return;
    const id = event.active.id as string;
    const container = findContainer(lists, id);
    const card = lists.find((l) => l.id === container)?.cards.find((c) => c.id === id);
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (readOnly) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(lists, activeId);
    const overContainer = findContainer(lists, overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setLists((prev) => {
      const activeList = prev.find((l) => l.id === activeContainer)!;
      const overList = prev.find((l) => l.id === overContainer)!;
      const movingCard = activeList.cards.find((c) => c.id === activeId);
      if (!movingCard) return prev;

      const overIndex = overList.cards.findIndex((c) => c.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : overList.cards.length;

      scheduleTaskSync(activeId, { boardListId: overContainer, position: insertAt });

      const nextLists = prev.map((list) => {
        if (list.id === activeContainer) {
          return { ...list, cards: list.cards.filter((c) => c.id !== activeId) };
        }
        if (list.id === overContainer) {
          const newCards = [...list.cards];
          newCards.splice(insertAt, 0, movingCard);
          return { ...list, cards: newCards };
        }
        return list;
      });

      if (socket && boardId) {
        socket.emit('board:move-card', { boardId, lists: nextLists });
      }

      return nextLists;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (readOnly) return;
    const currentActiveCard = activeCard;
    setActiveCard(null);

    const { active, over } = event;
    if (!over) {
      if (socket && boardId && currentActiveCard) {
        socket.emit('board:drag-end', { boardId, cardId: currentActiveCard.id, lists });
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(lists, activeId);
    const overContainer = findContainer(lists, overId);
    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      if (socket && boardId && currentActiveCard) {
        socket.emit('board:drag-end', { boardId, cardId: currentActiveCard.id, lists });
      }
      return;
    }

    setLists((prev) => {
      const nextLists = prev.map((list) => {
        if (list.id !== activeContainer) return list;
        const oldIndex = list.cards.findIndex((c) => c.id === activeId);
        const newIndex = list.cards.findIndex((c) => c.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return list;

        scheduleTaskSync(activeId, { boardListId: activeContainer, position: newIndex });

        return { ...list, cards: arrayMove(list.cards, oldIndex, newIndex) };
      });

      if (socket && boardId) {
        socket.emit('board:drag-end', { boardId, cardId: activeId, lists: nextLists });
        socket.emit('board:move-card', { boardId, lists: nextLists });
      }

      return nextLists;
    });
  }

  const remoteDraggedCardIds = new Set(
    Object.values(remoteDrags).map((r) => r.cardId)
  );

  return (
    <DndContext
      sensors={readOnly ? [] : sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full relative">
        {readOnly && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-[12.5px] font-medium text-amber-800 border border-amber-200">
            <Eye className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>View Only:</strong> You have viewer permissions on this workspace. Card movements and edits are disabled.
            </span>
          </div>
        )}

        {errorBanner && (
          <div className="mx-6 mt-3 flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-[#C4453D] border border-red-100">
            <span>{errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="ml-3 rounded p-1 text-[#C4453D] hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="board-scroll flex h-full items-start gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 py-4 sm:py-5">
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onRenameList={renameList}
              onDeleteList={deleteList}
              remoteDraggedCardIds={remoteDraggedCardIds}
              readOnly={readOnly}
            />
          ))}
          {!readOnly && <AddListColumn onAdd={addList} defaultColor={nextDefaultColor} />}
        </div>
      </div>

      {!readOnly && (
        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeCard && (
            <div className="w-[248px] rotate-2 cursor-grabbing rounded-xl border border-[#4C5FD5] bg-white p-3.5 shadow-[0_20px_40px_rgba(76,95,213,0.22)] ring-2 ring-[#4C5FD5]/20">
              <CardBody card={activeCard} />
            </div>
          )}
        </DragOverlay>
      )}

      {/* Remote Teammates' Live Dragging Cards Floating Overlay */}
      {Object.values(remoteDrags).map((drag) => (
        <div
          key={drag.clientId}
          style={{
            position: 'fixed',
            left: `${drag.x + 12}px`,
            top: `${drag.y + 12}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'left 75ms ease-out, top 75ms ease-out',
          }}
          className="w-[230px] rounded-xl border-2 border-[#4C5FD5] bg-white p-3 shadow-[0_16px_36px_rgba(23,26,33,0.2)] animate-in fade-in zoom-in-90 duration-150 rotate-3"
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8.5px] font-bold text-white shadow-xs"
              style={{ backgroundColor: drag.user.color || '#4C5FD5' }}
            >
              {drag.user.initials}
            </span>
            <span className="truncate text-[11px] font-semibold text-[#4C5FD5]">
              {drag.user.name} is moving
            </span>
            <MousePointer className="h-3 w-3 text-[#4C5FD5] animate-pulse ml-auto" />
          </div>

          <p className="text-[12.5px] font-medium leading-snug text-[#101828] line-clamp-2">
            {drag.cardTitle}
          </p>
        </div>
      ))}
    </DndContext>
  );
}