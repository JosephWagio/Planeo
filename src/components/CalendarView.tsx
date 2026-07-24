import { CalendarBlank } from "@phosphor-icons/react";
import type { Board } from "../types";
import { getBoardCards } from "./boardViewUtils";

interface CalendarViewProps {
  board: Board;
  searchQuery: string;
  onOpenCard: (cardId: string) => void;
}

export function CalendarView({
  board,
  searchQuery,
  onOpenCard,
}: CalendarViewProps) {
  const cards = getBoardCards(board, searchQuery);
  const scheduled = cards.filter(({ card }) => card.dueDate);
  const earliestDue = scheduled
    .map(({ card }) => card.dueDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0];
  const focusDate = earliestDue
    ? new Date(`${earliestDue}T00:00:00`)
    : new Date();
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstDay.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <main className="alternate-view calendar-view">
      <div className="view-heading">
        <div>
          <h1>
            {new Intl.DateTimeFormat("en", {
              month: "long",
              year: "numeric",
            }).format(focusDate)}
          </h1>
          <p>{scheduled.length} scheduled cards across this board</p>
        </div>
        <div className="view-stat">
          <CalendarBlank size={18} weight="duotone" />
          {cards.filter(({ card }) => !card.dueDate).length} unscheduled
        </div>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div className="calendar-weekday" key={day}>
            {day}
          </div>
        ))}
        {days.map((date) => {
          const key = dateKey(date);
          const dayCards = scheduled.filter(({ card }) => card.dueDate === key);
          return (
            <section
              className={`calendar-day ${
                date.getMonth() !== month ? "is-outside" : ""
              }`}
              key={key}
            >
              <time dateTime={key}>{date.getDate()}</time>
              <div className="calendar-cards">
                {dayCards.map(({ card }) => (
                  <button
                    type="button"
                    className={`calendar-card priority-edge-${
                      card.priority ?? "medium"
                    }`}
                    key={card.id}
                    onClick={() => onOpenCard(card.id)}
                  >
                    {card.title}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
