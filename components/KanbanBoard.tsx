'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Calendar, X, GripVertical, Trash2 } from 'lucide-react';
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

const initialLists: ListItem[] = [
  {
    id: 'todo',
    title: 'To Do',
    accent: '#4C5FD5',
    cards: [
      { id: 'c1', title: 'Draft Q3 roadmap outline', dueDate: '2026-08-15' },
      { id: 'c2', title: 'Review design system tokens' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    accent: '#E8A33D',
    cards: [
      { id: 'c3', title: 'Fix onboarding email bug', dueDate: '2026-08-12' },
      { id: 'c4', title: 'Set up staging environment' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    accent: '#17C3B2',
    cards: [{ id: 'c5', title: 'Ship navbar component' }],
  },
];

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/* ---------- Card ---------- */

function CardBody({ card }: { card: CardItem }) {
  return (
    <>
      <p className="text-[13.5px] leading-snug text-[#171A21]">{card.title}</p>
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

function SortableCard({ card, onDelete }: { card: CardItem; onDelete: (cardId: string) => void }) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
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
      {...attributes}
      {...listeners}
      className={`group relative cursor-grab rounded-xl border border-[#E3E5EC] bg-white p-3.5 pr-7 transition-shadow active:cursor-grabbing ${
        isDragging
          ? 'opacity-40'
          : 'shadow-[0_1px_2px_rgba(23,26,33,0.04)] hover:border-[#D3D7E3] hover:shadow-[0_6px_16px_rgba(23,26,33,0.08)]'
      }`}
    >
      <GripVertical className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D3D7E3] opacity-0 transition-opacity group-hover:opacity-100" />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleDeleteClick}
        onBlur={() => setPendingDelete(false)}
        aria-label="Delete card"
        title={pendingDelete ? 'Click again to confirm' : 'Delete card'}
        className={`absolute right-2 top-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors ${
          pendingDelete
            ? 'bg-red-500 text-white opacity-100'
            : 'text-[#D3D7E3] opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100'
        }`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
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
        className="w-full resize-none border-none text-[13.5px] text-[#171A21] outline-none placeholder:text-[#6B7280]"
      />
      <div className="mt-1 flex items-center gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-[#4C5FD5] px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
        >
          Add card
        </button>
        <button onClick={onCancel} aria-label="Cancel" className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#E9EAF0]">
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
  onAdd: (title: string, color: string) => void;
  defaultColor: string;
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [color, setColor] = useState(defaultColor);

  const trimmedColor = color.trim();
  const isValidColor = HEX_COLOR_PATTERN.test(trimmedColor);
  const swatchColor = isValidColor ? trimmedColor : defaultColor;

  function submit() {
    const trimmedTitle = value.trim();
    if (!trimmedTitle) return;
    onAdd(trimmedTitle, isValidColor ? trimmedColor : defaultColor);
    setValue('');
    setColor(defaultColor);
    setAdding(false);
  }

  function cancel() {
    setValue('');
    setColor(defaultColor);
    setAdding(false);
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex h-11 w-[272px] flex-shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[#D3D7E3] px-3.5 text-[13.5px] font-medium text-[#6B7280] transition-colors hover:border-[#4C5FD5] hover:bg-white hover:text-[#4C5FD5]"
      >
        <Plus className="h-4 w-4" />
        Add list
      </button>
    );
  }

  return (
    <div className="w-[272px] flex-shrink-0 rounded-xl border border-[#4C5FD5] bg-white p-2.5 shadow-[0_2px_8px_rgba(76,95,213,0.12)]">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') cancel();
        }}
        placeholder="List name…"
        className="w-full border-none text-[13.5px] text-[#171A21] outline-none placeholder:text-[#6B7280]"
      />

      <div className="mt-2 flex items-center gap-2">
        <span
          className="h-6 w-6 flex-shrink-0 rounded-md border border-[#E3E5EC]"
          style={{ backgroundColor: swatchColor }}
          aria-hidden="true"
        />
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') cancel();
          }}
          placeholder="#4C5FD5"
          spellCheck={false}
          className={`w-full rounded-md border bg-transparent px-2 py-1 text-[12.5px] outline-none placeholder:text-[#B0B4C0] ${
            color.trim() && !isValidColor
              ? 'border-[#C4453D] text-[#C4453D]'
              : 'border-[#E3E5EC] text-[#171A21] focus:border-[#4C5FD5]'
          }`}
        />
      </div>
      {color.trim() && !isValidColor && (
        <p className="mt-1 text-[11px] text-[#C4453D]">Enter a valid hex color, e.g. #4C5FD5</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-[#4C5FD5] px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3E4EC0]"
        >
          Add list
        </button>
        <button onClick={cancel} aria-label="Cancel" className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F6F7FB]">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- List column (droppable container + sortable cards) ---------- */

function ListColumn({
  list,
  onAddCard,
  onDeleteCard,
  onRenameList,
  onDeleteList,
}: {
  list: ListItem;
  onAddCard: (listId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameList: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [pendingDeleteList, setPendingDeleteList] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: list.id, data: { type: 'list' } });

  function startRename() {
    setTitleDraft(list.title);
    setRenaming(true);
    setMenuOpen(false);
    setPendingDeleteList(false);
  }

  function submitRename() {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== list.title) {
      onRenameList(list.id, trimmed);
    }
    setRenaming(false);
  }

  function cancelRename() {
    setTitleDraft(list.title);
    setRenaming(false);
  }

  function handleDeleteListClick() {
    if (pendingDeleteList) {
      onDeleteList(list.id);
      setMenuOpen(false);
      setPendingDeleteList(false);
    } else {
      setPendingDeleteList(true);
    }
  }

  return (
    <div
      className={`flex max-h-full w-[272px] flex-shrink-0 flex-col rounded-2xl border transition-colors ${
        isOver ? 'border-[#4C5FD5]/40 bg-[#EEF0FD]' : 'border-transparent bg-[#F1F2F6]'
      }`}
    >
      <div className="flex items-center justify-between px-3.5 pb-2 pt-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: list.accent }} />
          {renaming ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') cancelRename();
              }}
              onBlur={submitRename}
              className="w-full min-w-0 rounded-md border border-[#4C5FD5] bg-white px-1.5 py-0.5 text-[12.5px] font-semibold text-[#171A21] outline-none"
            />
          ) : (
            <h3 className="truncate text-[12.5px] font-semibold uppercase tracking-wide text-[#6B7280]">
              {list.title}
              <span className="ml-1.5 text-[#B0B4C0]">{list.cards.length}</span>
            </h3>
          )}
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setPendingDeleteList(false);
            }}
            aria-label={`${list.title} list options`}
            className="rounded-md p-1 text-[#6B7280] hover:bg-[#E3E5EC]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-1 min-w-[150px] rounded-lg border border-[#E3E5EC] bg-white p-1.5 shadow-[0_8px_24px_rgba(23,26,33,0.08)]"
              onMouseLeave={() => setPendingDeleteList(false)}
            >
              <button
                role="menuitem"
                onClick={startRename}
                className="w-full rounded-md px-2.5 py-1.5 text-left text-[13px] text-[#171A21] hover:bg-[#F6F7FB]"
              >
                Rename list
              </button>
              <button
                role="menuitem"
                onClick={handleDeleteListClick}
                className={`w-full rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  pendingDeleteList ? 'bg-red-50 text-[#C4453D] font-medium' : 'text-[#C4453D] hover:bg-[#F6F7FB]'
                }`}
              >
                {pendingDeleteList ? 'Click again to confirm' : 'Delete list'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto px-2.5 pb-1">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex min-h-[8px] flex-col gap-2">
            {list.cards.length === 0 && !isOver && (
              <p className="px-1 py-3 text-center text-[12.5px] text-[#B0B4C0]">No cards yet</p>
            )}
            {list.cards.map((card) => (
              <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
            ))}
          </div>
        </SortableContext>
      </div>

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
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-[#6B7280] transition-colors hover:bg-white hover:text-[#171A21]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add card
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Board ---------- */

const LIST_COLOR_PALETTE = ['#4C5FD5', '#17C3B2', '#E8A33D', '#C4453D', '#8A5CF6'];

export default function KanbanBoard() {
  const [lists, setLists] = useState<ListItem[]>(initialLists);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const nextDefaultColor = LIST_COLOR_PALETTE[lists.length % LIST_COLOR_PALETTE.length];

  function addCard(listId: string, title: string) {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, cards: [...list.cards, { id: crypto.randomUUID(), title }] }
          : list
      )
    );
  }

  function deleteCard(cardId: string) {
    setLists((prev) =>
      prev.map((list) => ({ ...list, cards: list.cards.filter((c) => c.id !== cardId) }))
    );
  }

  function addList(title: string, accent: string) {
    setLists((prev) => [...prev, { id: crypto.randomUUID(), title, accent, cards: [] }]);
  }

  function renameList(listId: string, title: string) {
    setLists((prev) => prev.map((list) => (list.id === listId ? { ...list, title } : list)));
  }

  function deleteList(listId: string) {
    setLists((prev) => prev.filter((list) => list.id !== listId));
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const container = findContainer(lists, id);
    const card = lists.find((l) => l.id === container)?.cards.find((c) => c.id === id);
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
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

      return prev.map((list) => {
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
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(lists, activeId);
    const overContainer = findContainer(lists, overId);
    if (!activeContainer || !overContainer || activeContainer !== overContainer) return;

    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== activeContainer) return list;
        const oldIndex = list.cards.findIndex((c) => c.id === activeId);
        const newIndex = list.cards.findIndex((c) => c.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return list;
        return { ...list, cards: arrayMove(list.cards, oldIndex, newIndex) };
      })
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board-scroll flex h-full items-start gap-4 overflow-x-auto px-6 py-5">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onRenameList={renameList}
            onDeleteList={deleteList}
          />
        ))}
        <AddListColumn onAdd={addList} defaultColor={nextDefaultColor} />
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeCard && (
          <div className="w-[248px] rotate-2 cursor-grabbing rounded-xl border border-[#D3D7E3] bg-white p-3.5 shadow-[0_16px_32px_rgba(23,26,33,0.16)]">
            <CardBody card={activeCard} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}