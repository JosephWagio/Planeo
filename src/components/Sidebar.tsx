import {
  CaretDoubleLeft,
  Plus,
  SquaresFour,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useBoardStore } from "../store";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const boards = useBoardStore((state) => state.boards);
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const addBoard = useBoardStore((state) => state.addBoard);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addBoard(title.trim());
    setTitle("");
    setAdding(false);
  };

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="brand">
        <button
          type="button"
          className="brand-mark"
          onClick={() => {
            if (collapsed) onToggle();
          }}
          aria-label={collapsed ? "Expand sidebar" : "Planeo home"}
        >
          <span />
          <span />
          <span />
        </button>
        {!collapsed && <span className="brand-name">Planeo</span>}
        <button
          type="button"
          className="icon-button sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CaretDoubleLeft
            size={18}
            weight="bold"
            className={collapsed ? "rotated" : ""}
          />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="sidebar-heading">
            <span>Your boards</span>
            <button
              type="button"
              className="icon-button"
              onClick={() => setAdding(true)}
              aria-label="Create board"
            >
              <Plus size={17} weight="bold" />
            </button>
          </div>

          <nav className="board-nav" aria-label="Boards">
            {boards.map((board) => (
              <div
                className={`board-nav-row ${
                  board.id === activeBoardId ? "is-active" : ""
                }`}
                key={board.id}
              >
                <button
                  type="button"
                  className="board-nav-button"
                  onClick={() => setActiveBoard(board.id)}
                >
                  <span
                    className="board-swatch"
                    style={{ backgroundColor: board.accent }}
                  />
                  <span>{board.title}</span>
                </button>
                {boards.length > 1 && (
                  <button
                    type="button"
                    className="board-delete"
                    onClick={() => deleteBoard(board.id)}
                    aria-label={`Delete ${board.title}`}
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            ))}
          </nav>

          {adding && (
            <div className="sidebar-add">
              <label htmlFor="new-board">Board name</label>
              <input
                id="new-board"
                autoFocus
                value={title}
                placeholder="e.g. Product sprint"
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                  if (event.key === "Escape") setAdding(false);
                }}
              />
              <div className="sidebar-add-actions">
                <button type="button" className="button primary" onClick={submit}>
                  Create
                </button>
                <button
                  type="button"
                  className="button quiet"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            <SquaresFour size={18} weight="duotone" />
            <span>Cloud workspace</span>
          </div>
          <UserMenu />
        </>
      )}
    </aside>
  );
}
