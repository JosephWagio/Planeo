# Planeo

A polished Kanban workspace and SaaS product experience built with React 19,
TypeScript, Vite, dnd-kit, Zustand, and Supabase. Planeo includes a responsive
marketing site, email/password authentication, protected workspaces, and
cloud-persisted board state.

## Features

- Public product landing page and responsive authentication screens
- Supabase email/password sign-up, login, logout, and password reset
- Per-user cloud workspaces protected by Postgres Row Level Security
- Multiple independently persisted boards
- Reorder lists, reorder cards, and move cards between lists
- Inline board, list, and card creation
- Card details with descriptions, due dates, labels, checklists, and comments
- Priorities and multi-member card assignment
- Fixed label palette with board-level filtering
- Workspace-wide card search across every board
- Kanban, calendar, and delivery timeline views
- Local mention notifications for `@amara`, `@leon`, `@maya`, and `@joseph`
- Optional checklist automation that moves completed cards to Done
- Clearly labeled local connection demos for Slack, GitHub, and Google Drive
- User-selectable board accent colors
- Keyboard drag support through dnd-kit
- Escape-to-close modal behavior and visible focus states
- Responsive layout with mobile horizontal snapping
- Fast local storage cache with debounced Supabase cloud synchronization
- Reduced-motion support

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Authentication → URL Configuration**, set the Site URL to your local or
   deployed URL. Add the same URL to Redirect URLs.
4. Copy `.env.example` to `.env.local`.
5. Add the project URL and publishable key:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is designed for browser use. User data remains protected by
the Row Level Security policies in the schema. Never place a Supabase
`service_role` key in a Vite environment variable.

If the environment variables are absent, the landing and authentication UI
still render and show a clear setup notice, but sign-in is disabled.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually
`http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The optimized production files are written to `dist/`.

## Architecture

The data shape is deliberately nested:

```text
boards
  lists
    cards
      checklist items
      comments
```

`src/store.ts` owns domain state and board mutations. `WorkspaceSync` hydrates
that state from the authenticated user's `workspaces` row and debounces writes
back to Supabase.
Presentation and interaction concerns are split across focused components:

- `BoardCanvas` coordinates dnd-kit sensors and drag outcomes.
- `BoardList` owns list-level inline creation and sortable card contexts.
- `BoardCard` renders compact metadata and accessible drag affordances.
- `CardModal` is rendered through a portal and edits the full card model.
- `Sidebar` handles board creation, switching, and deletion.

The database intentionally stores the nested board document as JSONB. This
matches the drag-heavy client state model and keeps each board mutation atomic,
while the `user_id` primary key and RLS policies isolate every account.

## Deployment

This is a static Vite application and can be deployed to Vercel, Netlify,
Cloudflare Pages, GitHub Pages, or any static host.

For Vercel:

1. Import the repository.
2. Keep the detected framework preset as Vite.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
6. Configure the deployed domain as an allowed Supabase Auth redirect URL.

For SPA hosting, rewrite unmatched paths such as `/login`, `/signup`, and
`/app` to `index.html`.
