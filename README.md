# Employee Task Management Dashboard

An internal admin console for managing an employee directory and the tasks assigned to them.
A single administrator signs in, maintains employee records, creates and assigns tasks, moves
them through their lifecycle, and reviews a live summary of the team's workload.

**[→ Setup and run instructions are in RUNNING.md](./RUNNING.md)**

---

## Features

**Authentication**
- Email and password sign-in for administrators
- Session held in a signed, http-only cookie; survives a page reload, cleared on sign-out
- Failed sign-ins rate limited per IP

**Employees**
- Create, view, edit and remove employee records
- Search across name, employee code, email and designation
- Filter by department and by active or inactive status, with pagination and sorting
- Deleting an employee **requires a reason**: a category plus at least 10 characters of detail.
  Every removal is written to an audit log that is viewable in the app, and the employee's
  tasks are preserved and moved to Unassigned rather than deleted
- Inactive employees cannot receive new task assignments

**Tasks**
- Create, edit and delete tasks with title, description, assigned employee, priority, due date
  and status
- Change status inline from the list, or move a task along from the board view
- Filter by status, priority, employee, unassigned, overdue and due-date range; search across
  title, description and assignee name
- Table view with pagination, or a three-column board grouped by status
- Overdue and due-soon tasks are highlighted; completion timestamps are tracked automatically
- Filter state lives in the URL, so a filtered view can be bookmarked or shared

**Dashboard**
- Totals for employees (active and inactive) and tasks
- Task counts by status and by priority, overdue count, due within seven days, unassigned count
- Completion rate and tasks completed in the last seven days
- Open workload per employee, and the most recently created tasks
- Every tile and row links through to the matching filtered task list

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16 (Docker), Prisma ORM |
| Auth | JWT in an http-only cookie, bcrypt password hashing |
| Validation | Zod schemas on every request body, query and route parameter |

---

## Project structure

```
employee-task-dashboard/
├── docker-compose.yml          PostgreSQL service
├── .env.example                Compose credentials
├── RUNNING.md                  Setup, run and troubleshooting guide
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma       Admin, Employee, Task, EmployeeDeletionLog
│   │   ├── migrations/
│   │   └── seed.ts             Admin account plus sample data
│   ├── prisma.config.ts
│   └── src/
│       ├── config/env.ts       Zod-validated environment, fails fast at startup
│       ├── lib/                Prisma client, logger
│       ├── middlewares/        authenticate, validate, rate limiters, error handler
│       ├── utils/              AppError, asyncHandler, pagination helpers
│       ├── modules/
│       │   ├── auth/           routes · controller · service · schema · token
│       │   ├── employees/      routes · controller · service · schema
│       │   ├── tasks/          routes · controller · service · schema
│       │   └── dashboard/      routes · controller · service
│       ├── routes.ts           Mounts /api/*
│       ├── app.ts              Middleware stack
│       └── server.ts           Listener and graceful shutdown
│
└── client/
    └── src/
        ├── api/                Axios instance and one module per resource
        ├── hooks/              Query and mutation hooks, debounce, auth
        ├── context/            Auth context and provider
        ├── components/
        │   ├── ui/             Button, Field, Modal, Badge, Card, Pagination, states
        │   └── layout/         AppLayout, Sidebar, Topbar, PageHeader
        ├── features/
        │   ├── dashboard/      Stat tiles, breakdowns, workload, recent tasks
        │   ├── employees/      Table, form modal, delete-with-reason modal, audit log
        │   └── tasks/          Table, board, filters, form modal, status select
        ├── pages/              Login, Dashboard, Employees, Tasks, NotFound
        ├── routes/             Router and protected-route guard
        └── lib/                Formatters, constants, helpers
```

Each backend module keeps the same shape: routes declare the endpoint and its validation,
controllers translate HTTP to a service call, and services own the Prisma access. Controllers
hold no query logic and services hold no HTTP concerns.

---

## Data model

| Model | Purpose |
| --- | --- |
| `Admin` | Dashboard user. Stores a bcrypt hash, never a password |
| `Employee` | Directory record: code, name, email, phone, department, designation, active flag |
| `Task` | Title, description, priority, status, due date, completion timestamp, assignee, creator |
| `EmployeeDeletionLog` | Snapshot of a removed employee with the reason, who removed them, when, and how many tasks were released |

A task's assignee is nullable with `onDelete: SetNull`, which is what lets an employee be
removed without destroying the work assigned to them. Indexes cover the fields the list
endpoints filter and sort on: task status, priority, assignee and due date; employee name,
department and active flag.

---

## Security

- **Passwords** hashed with bcrypt at a configurable cost (default 12). Plain passwords are
  never stored or logged
- **Sessions** are JWTs with an issuer and audience, delivered in an `httpOnly`,
  `SameSite=Strict` cookie, marked `Secure` in production. The token is never exposed to
  JavaScript, so it cannot be read by injected scripts
- **Sign-in** returns one generic message for both an unknown email and a wrong password, and
  always performs a bcrypt comparison so a missing account cannot be detected by response time
- **Rate limiting** on sign-in (5 failures per IP per 15 minutes), on mutations, and globally
- **Input validation** with strict Zod schemas that reject unknown fields, so a request cannot
  set columns it was not meant to touch. UUID route parameters are validated before any query
- **Headers and transport** via Helmet, an allow-list CORS origin with credentials, and
  `x-powered-by` disabled
- **Payload limits** of 10 kb on JSON and form bodies, plus `hpp` against parameter pollution
- **Error handling** maps known Prisma errors to clean status codes and hides stack traces when
  `NODE_ENV=production`. Logs redact cookies, authorization headers and password fields
- **Secrets** live only in `.env` files, which are gitignored. The API validates its whole
  environment at startup and refuses to boot on a weak or missing `JWT_SECRET`

---

## Design

A single-purpose palette of professional blues and greens on white and slate neutrals, defined
once as theme tokens in `client/src/index.css`:

- Blue carries structure, navigation, primary actions and the Pending/In-progress states
- Green marks completion and positive outcomes
- Priority is shown by depth rather than hue: deep blue for high, mid blue for medium, soft
  green for low
- Destructive actions use a deep navy rather than red, keeping the palette intact while still
  reading as serious

The layout is responsive throughout: a fixed sidebar on desktop collapses to a drawer on
mobile, and every data table switches to a card list on small screens. Loading states use
skeletons rather than spinners, empty states explain what to do next, and every action
confirms through a toast.
