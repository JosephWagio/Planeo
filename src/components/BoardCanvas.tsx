import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus, X } from "@phosphor-icons/react";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useBoardStore } from "../store";
import type { Board, Card } from "../types";
import { BoardCard } from "./BoardCard";
import { BoardList } from "./BoardList";

// dnd-kit currently publishes a React 18 JSX return type. The runtime is
// React 19 compatible, so these narrow aliases bridge only that declaration.
const SortableContext19 = SortableContext as unknown as ComponentType<{
  children: ReactNode;
  items: string[];
  strategy: typeof horizontalListSortingStrategy;
}>;

const DragOverlay19 = DragOverlay as unknown as ComponentType<{
  children: ReactNode;
  dropAnimation?: { duration: number; easing: string };
}>;

interface BoardCanvasProps {
  board: Board;
  selectedLabels: string[];
  searchQuery: string;
}

export function BoardCanvas({
  board,
  selectedLabels,
  searchQuery,
}: BoardCanvasProps) {
  const reorderLists = useBoardStore((state) => state.reorderLists);
  const moveCard = useBoardStore((state) => state.moveCard);
  const addList = useBoardStore((state) => state.addList);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card as Card);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over || active.id === over.id) return;
    const activeType = active.data.current?.type as string | undefined;
    const overType = over.data.current?.type as string | undefined;

    if (activeType === "list" && overType === "list") {
      reorderLists(board.id, String(active.id), String(over.id));
      return;
    }

    if (activeType === "card") {
      const targetListId =
        overType === "list"
          ? String(over.id)
          : (over.data.current?.listId as string | undefined);
      if (targetListId) {
        moveCard(
          board.id,
          String(active.id),
          targetListId,
          overType === "card" ? String(over.id) : undefined
        );
      }
    }
  };

  const submitList = () => {
    if (!listTitle.trim()) return;
    addList(board.id, listTitle.trim());
    setListTitle("");
    setAddingList(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveCard(null)}
      onDragEnd={handleDragEnd}
    >
      <main className="board-canvas" aria-label={`${board.title} board`}>
        <SortableContext19
          items={board.lists.map((list) => list.id)}
          strategy={horizontalListSortingStrategy}
        >
          {board.lists.map((list, index) => (
            <BoardList
              key={list.id}
              boardId={board.id}
              list={list}
              labels={board.labels}
              selectedLabels={selectedLabels}
              searchQuery={searchQuery}
              toneIndex={index}
            />
          ))}
        </SortableContext19>

        {addingList ? (
          <div className="new-list-form">
            <label htmlFor="new-list-title">List name</label>
            <input
              id="new-list-title"
              autoFocus
              value={listTitle}
              placeholder="e.g. Ready to ship"
              onChange={(event) => setListTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitList();
                if (event.key === "Escape") setAddingList(false);
              }}
            />
            <div className="add-card-actions">
              <button
                type="button"
                className="button primary"
                onClick={submitList}
              >
                Add list
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAddingList(false)}
                aria-label="Cancel adding list"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="add-list-button"
            onClick={() => setAddingList(true)}
          >
            <Plus size={18} weight="bold" />
            Add another list
          </button>
        )}
      </main>

      <DragOverlay19 dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {activeCard && (
          <div className="drag-overlay-wrap">
            <BoardCard
              card={activeCard}
              listId=""
              labels={board.labels}
              onOpen={() => undefined}
              overlay
            />
          </div>
        )}
      </DragOverlay19>
    </DndContext>
  );
}
