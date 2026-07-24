import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DotsSixVertical,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useBoardStore } from "../store";
import type { BoardLabel, BoardList as BoardListType } from "../types";
import { BoardCard } from "./BoardCard";
import { InlineEditor } from "./InlineEditor";

const SortableContext19 = SortableContext as unknown as ComponentType<{
  children: ReactNode;
  items: string[];
  strategy: typeof verticalListSortingStrategy;
}>;

interface BoardListProps {
  boardId: string;
  list: BoardListType;
  labels: BoardLabel[];
  selectedLabels: string[];
  searchQuery: string;
  toneIndex: number;
}

export function BoardList({
  boardId,
  list,
  labels,
  selectedLabels,
  searchQuery,
  toneIndex,
}: BoardListProps) {
  const renameList = useBoardStore((state) => state.renameList);
  const deleteList = useBoardStore((state) => state.deleteList);
  const addCard = useBoardStore((state) => state.addCard);
  const setActiveCard = useBoardStore((state) => state.setActiveCard);
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: "list" },
  });

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const cards = list.cards.filter((card) => {
    const matchesLabels =
      selectedLabels.length === 0 ||
      card.labelIds.some((labelId) => selectedLabels.includes(labelId));
    const matchesSearch =
      !normalizedSearch ||
      card.title.toLowerCase().includes(normalizedSearch) ||
      card.description.toLowerCase().includes(normalizedSearch);
    return matchesLabels && matchesSearch;
  });

  const submitCard = () => {
    if (!cardTitle.trim()) return;
    addCard(boardId, list.id, cardTitle.trim());
    setCardTitle("");
    setAddingCard(false);
  };

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`board-list list-tone-${toneIndex % 5} ${
        isDragging ? "is-dragging" : ""
      }`}
    >
      <div className="list-header">
        <button
          type="button"
          className="list-drag-handle"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${list.title} list`}
        >
          <DotsSixVertical size={18} weight="bold" />
        </button>
        <InlineEditor
          value={list.title}
          onSave={(title) => renameList(boardId, list.id, title)}
          className="list-title"
          ariaLabel="Rename list"
        />
        <span className="list-count">{cards.length}</span>
        <button
          type="button"
          className="icon-button list-delete"
          onClick={() => deleteList(boardId, list.id)}
          aria-label={`Delete ${list.title} list`}
        >
          <Trash size={16} />
        </button>
      </div>

      <SortableContext19
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`card-stack ${cards.length === 0 ? "is-empty" : ""}`}>
          {cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              listId={list.id}
              labels={labels}
              onOpen={() => setActiveCard(card.id)}
            />
          ))}
          {cards.length === 0 && (
            <div className="list-empty">
              {selectedLabels.length || normalizedSearch
                ? "No matching cards"
                : "Drop a card here"}
            </div>
          )}
        </div>
      </SortableContext19>

      {addingCard ? (
        <div className="add-card-form">
          <textarea
            autoFocus
            value={cardTitle}
            onChange={(event) => setCardTitle(event.target.value)}
            placeholder="What needs to be done?"
            aria-label="Card title"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitCard();
              }
              if (event.key === "Escape") setAddingCard(false);
            }}
          />
          <div className="add-card-actions">
            <button type="button" className="button primary" onClick={submitCard}>
              Add card
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setAddingCard(false)}
              aria-label="Cancel adding card"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="add-card-button"
          onClick={() => setAddingCard(true)}
        >
          <Plus size={17} weight="bold" />
          Add a card
        </button>
      )}
    </section>
  );
}
