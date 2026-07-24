import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  CalendarBlank,
  ChatCircle,
  CheckSquare,
  Flag,
  TextAlignLeft,
} from "@phosphor-icons/react";
import { TEAM_MEMBERS } from "../data";
import type { BoardLabel, Card } from "../types";

interface BoardCardProps {
  card: Card;
  listId: string;
  labels: BoardLabel[];
  onOpen: () => void;
  overlay?: boolean;
}

export function BoardCard({
  card,
  listId,
  labels,
  onOpen,
  overlay = false,
}: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", listId, card },
    disabled: overlay,
  });
  const completed = card.checklist.filter((item) => item.completed).length;
  const assignedLabels = labels.filter((label) =>
    card.labelIds.includes(label.id)
  );
  const assignees = TEAM_MEMBERS.filter((member) =>
    (card.assigneeIds ?? []).includes(member.id)
  );
  const isComplete =
    card.checklist.length > 0 && completed === card.checklist.length;
  const formattedDate = card.dueDate
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(new Date(`${card.dueDate}T00:00:00`))
    : null;

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`board-card card-priority-${card.priority ?? "medium"} ${
        isDragging ? "is-dragging" : ""
      } ${overlay ? "is-overlay" : ""}`}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      aria-label={`${card.title}. Open card details`}
    >
      {assignedLabels.length > 0 && (
        <div className="card-labels" aria-label="Card labels">
          {assignedLabels.map((label) => (
            <span
              key={label.id}
              className={`card-label label-${label.color}`}
              title={label.name}
            />
          ))}
        </div>
      )}
      <h3>{card.title}</h3>
      {card.description && (
        <p className="card-preview">{card.description}</p>
      )}
      {(card.description ||
        card.dueDate ||
        card.comments.length > 0 ||
        card.checklist.length > 0) && (
        <div className="card-meta">
          {card.description && (
            <span title="Has a description">
              <TextAlignLeft size={15} weight="bold" />
            </span>
          )}
          {formattedDate && (
            <span
              className={
                card.dueDate && new Date(card.dueDate) < new Date()
                  ? "due-overdue"
                  : ""
              }
            >
              <CalendarBlank size={15} weight="bold" />
              {formattedDate}
            </span>
          )}
          {card.comments.length > 0 && (
            <span title={`${card.comments.length} comments`}>
              <ChatCircle size={15} weight="bold" />
              {card.comments.length}
            </span>
          )}
          {card.checklist.length > 0 && (
            <span className={isComplete ? "check-complete" : ""}>
              <CheckSquare size={15} weight="bold" />
              {completed}/{card.checklist.length}
            </span>
          )}
        </div>
      )}
      <div className="card-footer">
        <span className={`priority priority-${card.priority ?? "medium"}`}>
          <Flag size={12} weight="fill" />
          {card.priority ?? "medium"}
        </span>
        {assignees.length > 0 && (
          <div className="card-assignees" aria-label="Assigned members">
            {assignees.slice(0, 3).map((member) => (
              <span
                key={member.id}
                className="mini-avatar"
                style={{ backgroundColor: member.color }}
                title={member.name}
              >
                {member.initials}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
