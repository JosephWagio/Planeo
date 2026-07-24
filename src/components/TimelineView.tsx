import { Flag, UserCircle } from "@phosphor-icons/react";
import { TEAM_MEMBERS } from "../data";
import type { Board } from "../types";
import { getBoardCards } from "./boardViewUtils";

interface TimelineViewProps {
  board: Board;
  searchQuery: string;
  onOpenCard: (cardId: string) => void;
}

export function TimelineView({
  board,
  searchQuery,
  onOpenCard,
}: TimelineViewProps) {
  const cards = getBoardCards(board, searchQuery).filter(
    ({ card }) => card.dueDate
  );
  const dates = cards.map(({ card }) =>
    new Date(`${card.dueDate}T00:00:00`).getTime()
  );
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  const range = Math.max(max - min, 86400000);

  return (
    <main className="alternate-view timeline-view">
      <div className="view-heading">
        <div>
          <h1>Delivery timeline</h1>
          <p>Scheduled work ordered by due date and current list</p>
        </div>
        <div className="timeline-legend">
          <span>Earlier</span>
          <span>Later</span>
        </div>
      </div>
      <div className="timeline-table">
        {cards
          .sort(
            (a, b) =>
              new Date(`${a.card.dueDate}T00:00:00`).getTime() -
              new Date(`${b.card.dueDate}T00:00:00`).getTime()
          )
          .map(({ card, listTitle }) => {
            const due = new Date(`${card.dueDate}T00:00:00`);
            const position = ((due.getTime() - min) / range) * 82;
            const assignee = TEAM_MEMBERS.find((member) =>
              (card.assigneeIds ?? []).includes(member.id)
            );
            return (
              <button
                type="button"
                className="timeline-row"
                key={card.id}
                onClick={() => onOpenCard(card.id)}
              >
                <div className="timeline-card-info">
                  <strong>{card.title}</strong>
                  <span>{listTitle}</span>
                </div>
                <div className="timeline-track">
                  <span
                    className={`timeline-marker priority-${
                      card.priority ?? "medium"
                    }`}
                    style={{ left: `${position}%` }}
                  >
                    <Flag size={11} weight="fill" />
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                    }).format(due)}
                  </span>
                </div>
                <div className="timeline-owner">
                  <UserCircle size={18} weight="duotone" />
                  {assignee?.initials ?? "Unassigned"}
                </div>
              </button>
            );
          })}
      </div>
    </main>
  );
}
