import {
  Bell,
  CalendarDots,
  Check,
  Funnel,
  GithubLogo,
  GoogleDriveLogo,
  Kanban,
  MagnifyingGlass,
  PaintBrush,
  Robot,
  Rows,
  SlackLogo,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { BOARD_COLORS } from "../data";
import { useBoardStore } from "../store";
import type { Board } from "../types";
import { InlineEditor } from "./InlineEditor";

export type BoardView = "kanban" | "calendar" | "timeline";

export interface SearchResult {
  boardId: string;
  boardTitle: string;
  cardId: string;
  cardTitle: string;
}

interface BoardHeaderProps {
  board: Board;
  selectedLabels: string[];
  searchQuery: string;
  searchResults: SearchResult[];
  view: BoardView;
  onSearchChange: (query: string) => void;
  onOpenResult: (result: SearchResult) => void;
  onViewChange: (view: BoardView) => void;
  onToggleLabel: (labelId: string) => void;
  onClearFilters: () => void;
}

const INTEGRATIONS = [
  { id: "slack", name: "Slack", Icon: SlackLogo },
  { id: "github", name: "GitHub", Icon: GithubLogo },
  { id: "drive", name: "Drive", Icon: GoogleDriveLogo },
] as const;

export function BoardHeader({
  board,
  selectedLabels,
  searchQuery,
  searchResults,
  view,
  onSearchChange,
  onOpenResult,
  onViewChange,
  onToggleLabel,
  onClearFilters,
}: BoardHeaderProps) {
  const renameBoard = useBoardStore((state) => state.renameBoard);
  const setBoardAccent = useBoardStore((state) => state.setBoardAccent);
  const toggleAutomation = useBoardStore((state) => state.toggleAutomation);
  const toggleIntegration = useBoardStore((state) => state.toggleIntegration);
  const notifications = useBoardStore((state) => state.notifications);
  const markNotificationsRead = useBoardStore(
    (state) => state.markNotificationsRead
  );
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const setActiveCard = useBoardStore((state) => state.setActiveCard);
  const [panel, setPanel] = useState<
    "filter" | "color" | "notifications" | "automation" | null
  >(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((notification) => !notification.read);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setPanel(null);
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const togglePanel = (
    next: "filter" | "color" | "notifications" | "automation"
  ) => setPanel((current) => (current === next ? null : next));

  return (
    <header className="board-header">
      <div className="board-title-group">
        <InlineEditor
          value={board.title}
          onSave={(title) => renameBoard(board.id, title)}
          className="board-title"
          ariaLabel="Rename board"
        />
        <span className="private-badge">Team</span>
      </div>

      <div className="view-switcher" aria-label="Board views">
        {[
          { id: "kanban", label: "Board", Icon: Kanban },
          { id: "calendar", label: "Calendar", Icon: CalendarDots },
          { id: "timeline", label: "Timeline", Icon: Rows },
        ].map(({ id, label, Icon }) => (
          <button
            type="button"
            key={id}
            className={view === id ? "is-active" : ""}
            onClick={() => onViewChange(id as BoardView)}
          >
            <Icon size={15} weight={view === id ? "fill" : "bold"} />
            {label}
          </button>
        ))}
      </div>

      <div className="board-tools" ref={popoverRef}>
        <div className="search-wrap">
          <MagnifyingGlass size={17} weight="bold" />
          <input
            value={searchQuery}
            placeholder="Search workspace"
            aria-label="Search workspace"
            onFocus={() => setSearchFocused(true)}
            onChange={(event) => {
              onSearchChange(event.target.value);
              setSearchFocused(true);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={13} weight="bold" />
            </button>
          )}
          {searchFocused && searchQuery.trim() && (
            <div className="popover search-results">
              <div className="popover-title">
                <span>Workspace results</span>
                <span className="popover-hint">{searchResults.length}</span>
              </div>
              {searchResults.length ? (
                searchResults.slice(0, 7).map((result) => (
                  <button
                    type="button"
                    key={result.cardId}
                    className="search-result"
                    onClick={() => {
                      onOpenResult(result);
                      setSearchFocused(false);
                    }}
                  >
                    <strong>{result.cardTitle}</strong>
                    <span>{result.boardTitle}</span>
                  </button>
                ))
              ) : (
                <p className="popover-empty">No cards match this search.</p>
              )}
            </div>
          )}
        </div>

        {selectedLabels.length > 0 && (
          <button
            type="button"
            className="filter-summary"
            onClick={onClearFilters}
          >
            {selectedLabels.length} active
            <X size={14} weight="bold" />
          </button>
        )}

        <div className="popover-anchor">
          <button
            type="button"
            className={`toolbar-button tool-filter ${
              panel === "filter" ? "is-active" : ""
            }`}
            onClick={() => togglePanel("filter")}
            aria-expanded={panel === "filter"}
          >
            <Funnel size={17} weight="bold" />
            Filter
          </button>
          {panel === "filter" && (
            <div className="popover filter-popover">
              <div className="popover-title">
                <span>Filter cards</span>
                <span className="popover-hint">Match any label</span>
              </div>
              {board.labels.map((label) => {
                const selected = selectedLabels.includes(label.id);
                return (
                  <button
                    type="button"
                    className="filter-option"
                    key={label.id}
                    onClick={() => onToggleLabel(label.id)}
                  >
                    <span className={`label-bar label-${label.color}`} />
                    <span>{label.name}</span>
                    {selected && <Check size={16} weight="bold" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="popover-anchor">
          <button
            type="button"
            className={`toolbar-button icon-only tool-automation ${
              panel === "automation" ? "is-active" : ""
            }`}
            onClick={() => togglePanel("automation")}
            aria-label="Automations and integrations"
            aria-expanded={panel === "automation"}
          >
            <Robot size={18} weight="bold" />
          </button>
          {panel === "automation" && (
            <div className="popover automation-popover">
              <div className="popover-title">
                <span>Workflow</span>
                <span className="popover-hint">Local rules</span>
              </div>
              <button
                type="button"
                className="automation-rule"
                onClick={() => toggleAutomation(board.id)}
              >
                <span>
                  <strong>Complete and move</strong>
                  <small>Move cards to Done at 100% checklist progress</small>
                </span>
                <span
                  className={`toggle ${
                    board.autoMoveCompleted ? "is-on" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div className="integration-heading">Connections</div>
              <div className="integration-list">
                {INTEGRATIONS.map(({ id, name, Icon }) => {
                  const connected = (board.integrations ?? []).includes(id);
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => toggleIntegration(board.id, id)}
                    >
                      <Icon size={19} weight="duotone" />
                      <span>{name}</span>
                      <small>{connected ? "Connected" : "Connect demo"}</small>
                    </button>
                  );
                })}
              </div>
              <p className="integration-note">
                Demo connections stay in this browser. No external data is sent.
              </p>
            </div>
          )}
        </div>

        <div className="popover-anchor">
          <button
            type="button"
            className={`toolbar-button icon-only tool-notifications ${
              panel === "notifications" ? "is-active" : ""
            }`}
            onClick={() => {
              togglePanel("notifications");
              markNotificationsRead();
            }}
            aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
            aria-expanded={panel === "notifications"}
          >
            <Bell size={18} weight="bold" />
            {unread.length > 0 && <span className="notification-count">{unread.length}</span>}
          </button>
          {panel === "notifications" && (
            <div className="popover notifications-popover">
              <div className="popover-title">
                <span>Notifications</span>
                <span className="popover-hint">Team activity</span>
              </div>
              {notifications.length ? (
                notifications.slice(0, 6).map((notification) => (
                  <button
                    type="button"
                    className="notification-item"
                    key={notification.id}
                    onClick={() => {
                      if (notification.boardId) {
                        setActiveBoard(notification.boardId);
                      }
                      if (notification.cardId) {
                        setActiveCard(notification.cardId);
                      }
                      setPanel(null);
                    }}
                  >
                    <span className={notification.read ? "" : "is-unread"} />
                    <span>
                      <strong>{notification.title}</strong>
                      <small>{notification.detail}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p className="popover-empty">You are all caught up.</p>
              )}
            </div>
          )}
        </div>

        <div className="popover-anchor desktop-color">
          <button
            type="button"
            className={`toolbar-button icon-only tool-color ${
              panel === "color" ? "is-active" : ""
            }`}
            onClick={() => togglePanel("color")}
            aria-label="Board color"
            aria-expanded={panel === "color"}
          >
            <PaintBrush size={17} weight="bold" />
          </button>
          {panel === "color" && (
            <div className="popover color-popover">
              <div className="popover-title">
                <span>Board color</span>
              </div>
              <div className="color-grid">
                {BOARD_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`color-choice ${
                      color === board.accent ? "is-selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBoardAccent(board.id, color)}
                    aria-label={`Use board color ${color}`}
                  >
                    {color === board.accent && <Check size={18} weight="bold" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="avatar" title="Joseph">
          JO
        </div>
      </div>
    </header>
  );
}
