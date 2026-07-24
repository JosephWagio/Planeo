import {
  CalendarBlank,
  Check,
  CheckSquare,
  ListChecks,
  Flag,
  Tag,
  TextAlignLeft,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TEAM_MEMBERS } from "../data";
import { useBoardStore } from "../store";
import type { Board, BoardList, Card, CardPriority } from "../types";

interface CardModalProps {
  board: Board;
  list: BoardList;
  card: Card;
}

export function CardModal({ board, list, card }: CardModalProps) {
  const setActiveCard = useBoardStore((state) => state.setActiveCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const addChecklistItem = useBoardStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useBoardStore(
    (state) => state.toggleChecklistItem
  );
  const deleteChecklistItem = useBoardStore(
    (state) => state.deleteChecklistItem
  );
  const addComment = useBoardStore((state) => state.addComment);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [checklistText, setChecklistText] = useState("");
  const [comment, setComment] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveCard(null);
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [setActiveCard]);

  const completed = card.checklist.filter((item) => item.completed).length;
  const progress = card.checklist.length
    ? Math.round((completed / card.checklist.length) * 100)
    : 0;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setActiveCard(null);
      }}
    >
      <div
        className="card-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
        ref={dialogRef}
      >
        <button
          type="button"
          className="icon-button modal-close"
          onClick={() => setActiveCard(null)}
          aria-label="Close card details"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="modal-heading">
          <div className="modal-heading-icon">
            <CheckSquare size={22} weight="duotone" />
          </div>
          <div>
            <input
              ref={titleRef}
              id="card-modal-title"
              className="modal-title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => {
                if (title.trim() && title.trim() !== card.title) {
                  updateCard(board.id, card.id, { title: title.trim() });
                } else {
                  setTitle(card.title);
                }
              }}
              aria-label="Card title"
            />
            <p>
              in <strong>{list.title}</strong>
            </p>
          </div>
        </div>

        <div className="modal-grid">
          <div className="modal-main">
            <section className="detail-section">
              <div className="detail-heading">
                <TextAlignLeft size={19} weight="bold" />
                <h2>Description</h2>
              </div>
              <label className="sr-only" htmlFor="card-description">
                Card description
              </label>
              <textarea
                id="card-description"
                className="description-input"
                value={description}
                placeholder="Add context, links, or acceptance criteria..."
                onChange={(event) => setDescription(event.target.value)}
                onBlur={() => {
                  if (description !== card.description) {
                    updateCard(board.id, card.id, { description });
                  }
                }}
              />
            </section>

            <section className="detail-section">
              <div className="detail-heading checklist-heading">
                <ListChecks size={20} weight="bold" />
                <h2>Checklist</h2>
                {card.checklist.length > 0 && (
                  <span>{progress}%</span>
                )}
              </div>
              {card.checklist.length > 0 && (
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label="Checklist progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <span style={{ transform: `scaleX(${progress / 100})` }} />
                </div>
              )}
              <div className="checklist-items">
                {card.checklist.map((item) => (
                  <div className="checklist-item" key={item.id}>
                    <button
                      type="button"
                      className={`checkbox ${
                        item.completed ? "is-checked" : ""
                      }`}
                      onClick={() =>
                        toggleChecklistItem(board.id, card.id, item.id)
                      }
                      aria-label={`Mark ${item.text} ${
                        item.completed ? "incomplete" : "complete"
                      }`}
                    >
                      {item.completed && <Check size={14} weight="bold" />}
                    </button>
                    <span className={item.completed ? "is-complete" : ""}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      className="icon-button checklist-delete"
                      onClick={() =>
                        deleteChecklistItem(board.id, card.id, item.id)
                      }
                      aria-label={`Delete ${item.text}`}
                    >
                      <X size={15} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="inline-add-row">
                <input
                  value={checklistText}
                  placeholder="Add an item"
                  aria-label="New checklist item"
                  onChange={(event) => setChecklistText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && checklistText.trim()) {
                      addChecklistItem(
                        board.id,
                        card.id,
                        checklistText.trim()
                      );
                      setChecklistText("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    if (!checklistText.trim()) return;
                    addChecklistItem(
                      board.id,
                      card.id,
                      checklistText.trim()
                    );
                    setChecklistText("");
                  }}
                >
                  Add
                </button>
              </div>
            </section>

            <section className="detail-section">
              <div className="detail-heading">
                <div className="avatar avatar-small">JO</div>
                <h2>Comments</h2>
              </div>
              <div className="comment-composer">
                <label className="sr-only" htmlFor="comment">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  placeholder="Write a comment..."
                  onChange={(event) => setComment(event.target.value)}
                />
                <button
                  type="button"
                  className="button primary"
                  disabled={!comment.trim()}
                  onClick={() => {
                    if (!comment.trim()) return;
                    addComment(board.id, card.id, comment.trim());
                    setComment("");
                  }}
                >
                  Comment
                </button>
                <span className="mention-hint">
                  Mention teammates with @amara, @leon, @maya, or @joseph
                </span>
              </div>
              {card.comments.length > 0 && (
                <div className="comments">
                  {card.comments.map((entry) => (
                    <div className="comment" key={entry.id}>
                      <div className="avatar avatar-small">JO</div>
                      <div>
                        <div className="comment-meta">
                          <strong>Joseph O.</strong>
                          <time dateTime={entry.createdAt}>
                            {new Intl.DateTimeFormat("en", {
                              month: "short",
                              day: "numeric",
                            }).format(new Date(entry.createdAt))}
                          </time>
                        </div>
                        <p>{entry.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="modal-sidebar">
            <section>
              <div className="side-section-title">
                <Flag size={16} weight="bold" />
                Priority
              </div>
              <div className="priority-grid">
                {(["low", "medium", "high", "urgent"] as CardPriority[]).map(
                  (priority) => (
                    <button
                      type="button"
                      key={priority}
                      className={`priority-choice priority-${priority} ${
                        (card.priority ?? "medium") === priority
                          ? "is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateCard(board.id, card.id, { priority })
                      }
                    >
                      <Flag size={12} weight="fill" />
                      {priority}
                    </button>
                  )
                )}
              </div>
            </section>

            <section>
              <div className="side-section-title">Assignees</div>
              <div className="assignee-picker">
                {TEAM_MEMBERS.map((member) => {
                  const selected = (card.assigneeIds ?? []).includes(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      className={selected ? "is-selected" : ""}
                      onClick={() =>
                        updateCard(board.id, card.id, {
                          assigneeIds: selected
                            ? (card.assigneeIds ?? []).filter(
                                (id) => id !== member.id
                              )
                            : [...(card.assigneeIds ?? []), member.id],
                        })
                      }
                    >
                      <span
                        className="mini-avatar"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </span>
                      <span>{member.name}</span>
                      {selected && <Check size={14} weight="bold" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="side-section-title">
                <Tag size={16} weight="bold" />
                Labels
              </div>
              <div className="modal-labels">
                {board.labels.map((label) => {
                  const selected = card.labelIds.includes(label.id);
                  return (
                    <button
                      type="button"
                      key={label.id}
                      className={`modal-label label-${label.color} ${
                        selected ? "is-selected" : ""
                      }`}
                      onClick={() =>
                        updateCard(board.id, card.id, {
                          labelIds: selected
                            ? card.labelIds.filter((id) => id !== label.id)
                            : [...card.labelIds, label.id],
                        })
                      }
                    >
                      {label.name}
                      {selected && <Check size={15} weight="bold" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <label className="side-section-title" htmlFor="due-date">
                <CalendarBlank size={16} weight="bold" />
                Due date
              </label>
              <input
                id="due-date"
                type="date"
                className="date-input"
                value={card.dueDate ?? ""}
                onChange={(event) =>
                  updateCard(board.id, card.id, {
                    dueDate: event.target.value || null,
                  })
                }
              />
            </section>

            <button
              type="button"
              className="danger-button"
              onClick={() => deleteCard(board.id, list.id, card.id)}
            >
              <Trash size={17} weight="bold" />
              Delete card
            </button>
          </aside>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
