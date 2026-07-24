import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOARD_COLORS, DEFAULT_LABELS, initialBoards } from "./data";
import type { Board, Card, Notification } from "./types";

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export interface WorkspaceSnapshot {
  boards: Board[];
  activeBoardId: string;
  notifications: Notification[];
}

interface BoardState extends WorkspaceSnapshot {
  boards: Board[];
  activeBoardId: string;
  activeCardId: string | null;
  notifications: Notification[];
  hydrateWorkspace: (snapshot: WorkspaceSnapshot) => void;
  resetWorkspace: () => void;
  setActiveBoard: (boardId: string) => void;
  setActiveCard: (cardId: string | null) => void;
  addBoard: (title: string) => void;
  deleteBoard: (boardId: string) => void;
  renameBoard: (boardId: string, title: string) => void;
  setBoardAccent: (boardId: string, accent: string) => void;
  addList: (boardId: string, title: string) => void;
  renameList: (boardId: string, listId: string, title: string) => void;
  deleteList: (boardId: string, listId: string) => void;
  reorderLists: (boardId: string, activeId: string, overId: string) => void;
  addCard: (boardId: string, listId: string, title: string) => void;
  deleteCard: (boardId: string, listId: string, cardId: string) => void;
  updateCard: (
    boardId: string,
    cardId: string,
    patch: Partial<Omit<Card, "id">>
  ) => void;
  moveCard: (
    boardId: string,
    cardId: string,
    targetListId: string,
    overCardId?: string
  ) => void;
  addChecklistItem: (boardId: string, cardId: string, text: string) => void;
  toggleChecklistItem: (
    boardId: string,
    cardId: string,
    itemId: string
  ) => void;
  deleteChecklistItem: (
    boardId: string,
    cardId: string,
    itemId: string
  ) => void;
  addComment: (boardId: string, cardId: string, text: string) => void;
  toggleAutomation: (boardId: string) => void;
  toggleIntegration: (boardId: string, integrationId: string) => void;
  markNotificationsRead: () => void;
}

const updateBoard = (
  boards: Board[],
  boardId: string,
  updater: (board: Board) => Board
) => boards.map((board) => (board.id === boardId ? updater(board) : board));

const updateCardInBoard = (
  board: Board,
  cardId: string,
  updater: (card: Card) => Card
): Board => ({
  ...board,
  lists: board.lists.map((list) => ({
    ...list,
    cards: list.cards.map((card) =>
      card.id === cardId ? updater(card) : card
    ),
  })),
});

const enrichPersistedBoards = (boards: Board[]): Board[] =>
  boards.map((board) => {
    const seededBoard = initialBoards.find((item) => item.id === board.id);
    return {
      ...board,
      autoMoveCompleted:
        board.autoMoveCompleted ?? seededBoard?.autoMoveCompleted ?? false,
      integrations: board.integrations ?? seededBoard?.integrations ?? [],
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => {
          const seededCard = seededBoard?.lists
            .flatMap((seededList) => seededList.cards)
            .find((item) => item.id === card.id);
          return {
            ...card,
            priority: card.priority ?? seededCard?.priority ?? "medium",
            assigneeIds:
              card.assigneeIds ?? seededCard?.assigneeIds ?? ["joseph"],
          };
        }),
      })),
    };
  });

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notification-welcome",
    title: "Amara mentioned you",
    detail: "Homepage wireframes are ready for review.",
    createdAt: "2026-07-24T08:30:00.000Z",
    read: false,
    cardId: "card-wireframes",
    boardId: "board-launch",
  },
];

const NEW_USER_BOARD: Board = {
  id: "board-starter",
  title: "My Planeo board",
  accent: "#6f52b5",
  labels: DEFAULT_LABELS.map((label) => ({ ...label })),
  autoMoveCompleted: false,
  integrations: [],
  lists: [
    {
      id: "list-starter-guide",
      title: "Starter guide",
      cards: [
        {
          id: "card-welcome",
          title: "Welcome to Planeo",
          description:
            "This is your clean workspace. Rename this board, add a card, or drag work between lists when you are ready.",
          labelIds: [],
          dueDate: null,
          checklist: [
            {
              id: "check-create-card",
              text: "Create your first card",
              completed: false,
            },
            {
              id: "check-drag-card",
              text: "Drag it to another list",
              completed: false,
            },
            {
              id: "check-open-details",
              text: "Open the card details",
              completed: false,
            },
          ],
          comments: [],
          priority: "low",
          assigneeIds: [],
        },
      ],
    },
    { id: "list-today", title: "Today", cards: [] },
    { id: "list-this-week", title: "This week", cards: [] },
    { id: "list-later", title: "Later", cards: [] },
  ],
};

export const createStarterWorkspace = (): WorkspaceSnapshot => ({
  boards: [structuredClone(NEW_USER_BOARD)],
  activeBoardId: NEW_USER_BOARD.id,
  notifications: [],
});

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      boards: initialBoards,
      activeBoardId: initialBoards[0].id,
      activeCardId: null,
      notifications: INITIAL_NOTIFICATIONS,

      hydrateWorkspace: (snapshot) =>
        set({
          boards: enrichPersistedBoards(snapshot.boards),
          activeBoardId:
            snapshot.boards.some(
              (board) => board.id === snapshot.activeBoardId
            )
              ? snapshot.activeBoardId
              : snapshot.boards[0]?.id ?? initialBoards[0].id,
          notifications: snapshot.notifications,
          activeCardId: null,
        }),

      resetWorkspace: () =>
        set({ ...createStarterWorkspace(), activeCardId: null }),

      setActiveBoard: (activeBoardId) =>
        set({ activeBoardId, activeCardId: null }),
      setActiveCard: (activeCardId) => set({ activeCardId }),

      addBoard: (title) =>
        set((state) => {
          const id = uid("board");
          const board: Board = {
            id,
            title,
            accent: BOARD_COLORS[state.boards.length % BOARD_COLORS.length],
            labels: DEFAULT_LABELS.map((label) => ({ ...label })),
            autoMoveCompleted: false,
            integrations: [],
            lists: [
              { id: uid("list"), title: "To do", cards: [] },
              { id: uid("list"), title: "In progress", cards: [] },
              { id: uid("list"), title: "Done", cards: [] },
            ],
          };
          return {
            boards: [...state.boards, board],
            activeBoardId: id,
            activeCardId: null,
          };
        }),

      deleteBoard: (boardId) =>
        set((state) => {
          if (state.boards.length === 1) return state;
          const boards = state.boards.filter((board) => board.id !== boardId);
          return {
            boards,
            activeBoardId:
              state.activeBoardId === boardId
                ? boards[0].id
                : state.activeBoardId,
            activeCardId: null,
          };
        }),

      renameBoard: (boardId, title) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            title,
          })),
        })),

      setBoardAccent: (boardId, accent) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            accent,
          })),
        })),

      addList: (boardId, title) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            lists: [
              ...board.lists,
              { id: uid("list"), title, cards: [] },
            ],
          })),
        })),

      renameList: (boardId, listId, title) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            lists: board.lists.map((list) =>
              list.id === listId ? { ...list, title } : list
            ),
          })),
        })),

      deleteList: (boardId, listId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            lists: board.lists.filter((list) => list.id !== listId),
          })),
          activeCardId: null,
        })),

      reorderLists: (boardId, activeId, overId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => {
            const oldIndex = board.lists.findIndex(
              (list) => list.id === activeId
            );
            const newIndex = board.lists.findIndex((list) => list.id === overId);
            if (oldIndex < 0 || newIndex < 0) return board;
            return { ...board, lists: arrayMove(board.lists, oldIndex, newIndex) };
          }),
        })),

      addCard: (boardId, listId, title) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            lists: board.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    cards: [
                      ...list.cards,
                      {
                        id: uid("card"),
                        title,
                        description: "",
                        labelIds: [],
                        dueDate: null,
                        checklist: [],
                        comments: [],
                        priority: "medium",
                        assigneeIds: ["joseph"],
                      },
                    ],
                  }
                : list
            ),
          })),
        })),

      deleteCard: (boardId, listId, cardId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            lists: board.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    cards: list.cards.filter((card) => card.id !== cardId),
                  }
                : list
            ),
          })),
          activeCardId:
            state.activeCardId === cardId ? null : state.activeCardId,
        })),

      updateCard: (boardId, cardId, patch) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) =>
            updateCardInBoard(board, cardId, (card) => ({ ...card, ...patch }))
          ),
        })),

      moveCard: (boardId, cardId, targetListId, overCardId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => {
            let movingCard: Card | undefined;
            let sourceListId = "";
            board.lists.forEach((list) => {
              const found = list.cards.find((card) => card.id === cardId);
              if (found) {
                movingCard = found;
                sourceListId = list.id;
              }
            });
            if (!movingCard) return board;

            const listsWithoutCard = board.lists.map((list) => ({
              ...list,
              cards: list.cards.filter((card) => card.id !== cardId),
            }));

            return {
              ...board,
              lists: listsWithoutCard.map((list) => {
                if (list.id !== targetListId) return list;
                const insertAt = overCardId
                  ? list.cards.findIndex((card) => card.id === overCardId)
                  : list.cards.length;
                const safeIndex = insertAt < 0 ? list.cards.length : insertAt;
                const cards = [...list.cards];
                if (sourceListId === targetListId && overCardId === cardId) {
                  return { ...list, cards };
                }
                cards.splice(safeIndex, 0, movingCard as Card);
                return { ...list, cards };
              }),
            };
          }),
        })),

      addChecklistItem: (boardId, cardId, text) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) =>
            updateCardInBoard(board, cardId, (card) => ({
              ...card,
              checklist: [
                ...card.checklist,
                { id: uid("check"), text, completed: false },
              ],
            }))
          ),
        })),

      toggleChecklistItem: (boardId, cardId, itemId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => {
            let completedCard: Card | null = null;
            const withChecklist = updateCardInBoard(board, cardId, (card) => {
              const checklist = card.checklist.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              );
              const updated = { ...card, checklist };
              if (
                board.autoMoveCompleted &&
                checklist.length > 0 &&
                checklist.every((item) => item.completed)
              ) {
                completedCard = updated;
              }
              return updated;
            });

            if (!completedCard) return withChecklist;
            const doneList =
              withChecklist.lists.find((list) =>
                list.title.toLowerCase().includes("done")
              ) ?? withChecklist.lists[withChecklist.lists.length - 1];
            if (!doneList) return withChecklist;
            return {
              ...withChecklist,
              lists: withChecklist.lists.map((list) => ({
                ...list,
                cards:
                  list.id === doneList.id
                    ? [
                        ...list.cards.filter((card) => card.id !== cardId),
                        completedCard as Card,
                      ]
                    : list.cards.filter((card) => card.id !== cardId),
              })),
            };
          }),
        })),

      deleteChecklistItem: (boardId, cardId, itemId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) =>
            updateCardInBoard(board, cardId, (card) => ({
              ...card,
              checklist: card.checklist.filter((item) => item.id !== itemId),
            }))
          ),
        })),

      addComment: (boardId, cardId, text) =>
        set((state) => {
          const mentioned = /@(amara|leon|maya|joseph)\b/i.exec(text);
          const card = state.boards
            .find((board) => board.id === boardId)
            ?.lists.flatMap((list) => list.cards)
            .find((item) => item.id === cardId);
          const notification: Notification | null = mentioned
            ? {
                id: uid("notification"),
                title: `Mentioned @${mentioned[1].toLowerCase()}`,
                detail: card?.title ?? "Card comment",
                createdAt: new Date().toISOString(),
                read: false,
                boardId,
                cardId,
              }
            : null;
          return {
            boards: updateBoard(state.boards, boardId, (board) =>
              updateCardInBoard(board, cardId, (item) => ({
                ...item,
                comments: [
                  ...item.comments,
                  {
                    id: uid("comment"),
                    text,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }))
            ),
            notifications: notification
              ? [notification, ...state.notifications]
              : state.notifications,
          };
        }),

      toggleAutomation: (boardId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => ({
            ...board,
            autoMoveCompleted: !board.autoMoveCompleted,
          })),
        })),

      toggleIntegration: (boardId, integrationId) =>
        set((state) => ({
          boards: updateBoard(state.boards, boardId, (board) => {
            const integrations = board.integrations ?? [];
            return {
              ...board,
              integrations: integrations.includes(integrationId)
                ? integrations.filter((id) => id !== integrationId)
                : [...integrations, integrationId],
            };
          }),
        })),

      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),
    }),
    {
      name: "planeo-board-storage",
      version: 1,
      partialize: ({ boards, activeBoardId, notifications }) => ({
        boards,
        activeBoardId,
        notifications,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<BoardState>;
        return {
          ...currentState,
          ...persisted,
          boards: enrichPersistedBoards(
            persisted.boards ?? currentState.boards
          ),
          notifications:
            persisted.notifications ?? currentState.notifications,
        };
      },
    }
  )
);
