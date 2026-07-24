import type { Board, Card } from "../types";

export interface LocatedCard {
  card: Card;
  listTitle: string;
}

export function getBoardCards(
  board: Board,
  searchQuery: string
): LocatedCard[] {
  const search = searchQuery.trim().toLowerCase();
  return board.lists.flatMap((list) =>
    list.cards
      .filter(
        (card) =>
          !search ||
          card.title.toLowerCase().includes(search) ||
          card.description.toLowerCase().includes(search)
      )
      .map((card) => ({ card, listTitle: list.title }))
  );
}
