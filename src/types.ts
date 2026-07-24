export type LabelColor = "blue" | "green" | "amber" | "rose" | "violet";

export interface BoardLabel {
  id: string;
  name: string;
  color: LabelColor;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export type CardPriority = "low" | "medium" | "high" | "urgent";

export interface Card {
  id: string;
  title: string;
  description: string;
  labelIds: string[];
  dueDate: string | null;
  checklist: ChecklistItem[];
  comments: Comment[];
  priority?: CardPriority;
  assigneeIds?: string[];
}

export interface BoardList {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  accent: string;
  lists: BoardList[];
  labels: BoardLabel[];
  autoMoveCompleted?: boolean;
  integrations?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
  cardId?: string;
  boardId?: string;
}
