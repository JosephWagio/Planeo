import type { Board, BoardLabel, TeamMember } from "./types";

export const BOARD_COLORS = [
  "#3157d5",
  "#007c6d",
  "#be4b2f",
  "#6f52b5",
  "#b26a00",
] as const;

export const DEFAULT_LABELS: BoardLabel[] = [
  { id: "label-product", name: "Product", color: "blue" },
  { id: "label-growth", name: "Growth", color: "green" },
  { id: "label-review", name: "Review", color: "amber" },
  { id: "label-blocked", name: "Blocked", color: "rose" },
  { id: "label-research", name: "Research", color: "violet" },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "joseph", name: "Joseph O.", initials: "JO", color: "#dce4ff" },
  { id: "amara", name: "Amara N.", initials: "AN", color: "#d8f1e8" },
  { id: "leon", name: "Leon K.", initials: "LK", color: "#f8e2c2" },
  { id: "maya", name: "Maya R.", initials: "MR", color: "#eadcf7" },
];

export const initialBoards: Board[] = [
  {
    id: "board-launch",
    title: "Website launch",
    accent: BOARD_COLORS[0],
    labels: DEFAULT_LABELS,
    autoMoveCompleted: true,
    integrations: ["github"],
    lists: [
      {
        id: "list-ideas",
        title: "Ideas",
        cards: [
          {
            id: "card-brief",
            title: "Shape the launch narrative",
            description:
              "Turn the positioning workshop into a focused story for the new site.",
            labelIds: ["label-research"],
            dueDate: null,
            checklist: [
              { id: "check-1", text: "Review workshop notes", completed: true },
              { id: "check-2", text: "Draft narrative arc", completed: false },
            ],
            comments: [],
            priority: "high",
            assigneeIds: ["amara", "joseph"],
          },
          {
            id: "card-competitors",
            title: "Audit competitor homepages",
            description: "",
            labelIds: ["label-research"],
            dueDate: null,
            checklist: [],
            comments: [],
            priority: "medium",
            assigneeIds: ["maya"],
          },
        ],
      },
      {
        id: "list-progress",
        title: "In progress",
        cards: [
          {
            id: "card-wireframes",
            title: "Responsive homepage wireframes",
            description:
              "Cover desktop, tablet, and the critical mobile conversion path.",
            labelIds: ["label-product"],
            dueDate: "2026-08-02",
            checklist: [
              { id: "check-3", text: "Desktop", completed: true },
              { id: "check-4", text: "Tablet", completed: true },
              { id: "check-5", text: "Mobile", completed: false },
            ],
            comments: [
              {
                id: "comment-1",
                text: "Mobile hierarchy is ready for review.",
                createdAt: "2026-07-23T10:30:00.000Z",
              },
            ],
            priority: "urgent",
            assigneeIds: ["joseph", "leon"],
          },
          {
            id: "card-copy",
            title: "Write conversion copy",
            description: "",
            labelIds: ["label-growth"],
            dueDate: "2026-08-05",
            checklist: [],
            comments: [],
            priority: "high",
            assigneeIds: ["amara"],
          },
        ],
      },
      {
        id: "list-review",
        title: "Review",
        cards: [
          {
            id: "card-system",
            title: "Component library foundations",
            description:
              "Tokens, buttons, inputs, navigation, cards, and responsive layout primitives.",
            labelIds: ["label-product", "label-review"],
            dueDate: "2026-07-29",
            checklist: [
              { id: "check-6", text: "Color tokens", completed: true },
              { id: "check-7", text: "Core components", completed: true },
              { id: "check-8", text: "Accessibility pass", completed: false },
            ],
            comments: [],
            priority: "medium",
            assigneeIds: ["joseph", "maya"],
          },
        ],
      },
      {
        id: "list-done",
        title: "Done",
        cards: [
          {
            id: "card-kickoff",
            title: "Project kickoff",
            description: "Goals, owners, cadence, and success criteria aligned.",
            labelIds: ["label-product"],
            dueDate: "2026-07-18",
            checklist: [],
            comments: [],
            priority: "low",
            assigneeIds: ["leon"],
          },
          {
            id: "card-analytics",
            title: "Analytics measurement plan",
            description: "",
            labelIds: ["label-growth"],
            dueDate: null,
            checklist: [],
            comments: [],
            priority: "medium",
            assigneeIds: ["amara"],
          },
        ],
      },
    ],
  },
  {
    id: "board-content",
    title: "Content calendar",
    accent: BOARD_COLORS[1],
    labels: DEFAULT_LABELS,
    autoMoveCompleted: false,
    integrations: [],
    lists: [
      {
        id: "list-content-ideas",
        title: "Backlog",
        cards: [
          {
            id: "card-case-study",
            title: "Customer story: Northstar Studio",
            description: "Interview notes and first-draft narrative.",
            labelIds: ["label-growth"],
            dueDate: null,
            checklist: [],
            comments: [],
            priority: "high",
            assigneeIds: ["maya", "joseph"],
          },
        ],
      },
      { id: "list-content-writing", title: "Writing", cards: [] },
      { id: "list-content-published", title: "Published", cards: [] },
    ],
  },
];
