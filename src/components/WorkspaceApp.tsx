import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createStarterWorkspace, useBoardStore } from "../store";
import { BoardCanvas } from "./BoardCanvas";
import {
  BoardHeader,
  type BoardView,
  type SearchResult,
} from "./BoardHeader";
import { CalendarView } from "./CalendarView";
import { CardModal } from "./CardModal";
import { Sidebar } from "./Sidebar";
import { TimelineView } from "./TimelineView";
import { WorkspaceSync } from "./WorkspaceSync";

function WorkspaceLoading() {
  return (
    <div className="app-loading" role="status">
      <span className="app-loading-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <strong>Planeo</strong>
      <small>Preparing your workspace…</small>
    </div>
  );
}

export function WorkspaceApp() {
  const { user } = useAuth();
  const [preparedUserId, setPreparedUserId] = useState<string | null>(null);
  const boards = useBoardStore((state) => state.boards);
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const activeCardId = useBoardStore((state) => state.activeCardId);
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const setActiveCard = useBoardStore((state) => state.setActiveCard);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.innerWidth <= 600
  );
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<BoardView>("kanban");
  const board = boards.find((item) => item.id === activeBoardId) ?? boards[0];

  useEffect(() => {
    if (!user) return;
    useBoardStore.getState().hydrateWorkspace(createStarterWorkspace());
    setPreparedUserId(user.id);
  }, [user]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return boards.flatMap((resultBoard) =>
      resultBoard.lists.flatMap((list) =>
        list.cards
          .filter(
            (card) =>
              card.title.toLowerCase().includes(query) ||
              card.description.toLowerCase().includes(query)
          )
          .map((card) => ({
            boardId: resultBoard.id,
            boardTitle: resultBoard.title,
            cardId: card.id,
            cardTitle: card.title,
          }))
      )
    );
  }, [boards, searchQuery]);

  const activeCardLocation = useMemo(() => {
    if (!activeCardId || !board) return null;
    for (const list of board.lists) {
      const card = list.cards.find((item) => item.id === activeCardId);
      if (card) return { list, card };
    }
    return null;
  }, [activeCardId, board]);

  if (!user || preparedUserId !== user.id || !board) {
    return <WorkspaceLoading />;
  }

  return (
    <div
      className="app-shell"
      style={{ "--board-accent": board.accent } as React.CSSProperties}
    >
      <a className="skip-link" href="#workspace-main">
        Skip to board
      </a>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      <div className="workspace">
        <BoardHeader
          board={board}
          selectedLabels={selectedLabels}
          searchQuery={searchQuery}
          searchResults={searchResults}
          view={view}
          onSearchChange={setSearchQuery}
          onViewChange={setView}
          onOpenResult={(result) => {
            setActiveBoard(result.boardId);
            setActiveCard(result.cardId);
          }}
          onToggleLabel={(labelId) =>
            setSelectedLabels((selected) =>
              selected.includes(labelId)
                ? selected.filter((id) => id !== labelId)
                : [...selected, labelId]
            )
          }
          onClearFilters={() => setSelectedLabels([])}
        />
        {view === "kanban" && (
          <BoardCanvas
            board={board}
            selectedLabels={selectedLabels}
            searchQuery={searchQuery}
          />
        )}
        {view === "calendar" && (
          <CalendarView
            board={board}
            searchQuery={searchQuery}
            onOpenCard={setActiveCard}
          />
        )}
        {view === "timeline" && (
          <TimelineView
            board={board}
            searchQuery={searchQuery}
            onOpenCard={setActiveCard}
          />
        )}
      </div>

      {activeCardLocation && (
        <CardModal
          board={board}
          list={activeCardLocation.list}
          card={activeCardLocation.card}
        />
      )}
      <WorkspaceSync />
    </div>
  );
}
