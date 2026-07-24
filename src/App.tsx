import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { BoardCanvas } from "./components/BoardCanvas";
import {
  BoardHeader,
  type BoardView,
  type SearchResult,
} from "./components/BoardHeader";
import { CalendarView } from "./components/CalendarView";
import { CardModal } from "./components/CardModal";
import { LandingPage } from "./components/LandingPage";
import { Sidebar } from "./components/Sidebar";
import { TimelineView } from "./components/TimelineView";
import { WorkspaceSync } from "./components/WorkspaceSync";
import { createStarterWorkspace, useBoardStore } from "./store";

function WorkspaceApp() {
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
    if (!activeCardId) return null;
    for (const list of board.lists) {
      const card = list.cards.find((item) => item.id === activeCardId);
      if (card) return { list, card };
    }
    return null;
  }, [activeCardId, board.lists]);

  if (!board) return null;

  return (
    <div
      className="app-shell"
      style={{ "--board-accent": board.accent } as React.CSSProperties}
    >
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

function LoadingScreen() {
  return (
    <div className="app-loading" role="status">
      <span className="app-loading-mark">
        <i />
        <i />
        <i />
      </span>
      <strong>Planeo</strong>
      <small>Opening your workspace…</small>
    </div>
  );
}

export function App() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);
  const [preparedUserId, setPreparedUserId] = useState<string | null>(null);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  const navigate = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (loading) return;
    if (user && path !== "/app" && path !== "/reset-password") {
      window.history.replaceState({}, "", "/app");
      setPath("/app");
    }
    if (!user && path === "/app") {
      window.history.replaceState({}, "", "/login");
      setPath("/login");
    }
  }, [loading, path, user]);

  useEffect(() => {
    if (!user) {
      setPreparedUserId(null);
      return;
    }
    useBoardStore.getState().hydrateWorkspace(createStarterWorkspace());
    setPreparedUserId(user.id);
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (user && path === "/reset-password") {
    return <AuthPage mode="reset" navigate={navigate} />;
  }
  if (user && preparedUserId !== user.id) return <LoadingScreen />;
  if (user) return <WorkspaceApp />;
  if (
    path === "/login" ||
    path === "/signup" ||
    path === "/reset-password"
  ) {
    return (
      <AuthPage
        key={path}
        mode={
          path === "/signup"
            ? "signup"
            : path === "/reset-password"
              ? "reset"
              : "login"
        }
        navigate={navigate}
      />
    );
  }
  return <LandingPage navigate={navigate} />;
}
