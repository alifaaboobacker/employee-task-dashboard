# Running the application

Step-by-step instructions to get the Employee Task Management Dashboard running on a local
machine, and to build it for production.

---

## 1. Prerequisites

| Tool | Minimum version | Check with |
| --- | --- | --- |
| Node.js | 20 (tested on 25) | `node -v` |
| npm | 10 | `npm -v` |
| Docker Desktop | running | `docker --version` |

Docker only hosts PostgreSQL. The API and the web app run directly on Node.

---

## 2. Install dependencies

Run these from the project root:

```bash
cd server
npm install

cd ../client
npm install
```

---

## 3. Create the environment files

Three `.env` files are needed. Each has a committed `.env.example` next to it. Copy, then edit.

```bash
# from the project root
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell use `Copy-Item .env.example .env` instead of `cp`.

### Root `.env` — used by Docker Compose

| Variable | Purpose | Example |
| --- | --- | --- |
| `POSTGRES_USER` | Database user that Compose creates | `etd_admin` |
| `POSTGRES_PASSWORD` | Password for that user | a long random string |
| `POSTGRES_DB` | Database name | `etd` |
| `POSTGRES_PORT` | Host port mapped to the container | `5434` |

### `server/.env` — used by the API

| Variable | Purpose | Example |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test` or `production` | `development` |
| `PORT` | Port the API listens on | `5000` |
| `DATABASE_URL` | Postgres connection string. The user, password, port and database must match the root `.env` | `postgresql://etd_admin:PASSWORD@localhost:5434/etd?schema=public` |
| `JWT_SECRET` | Signing key for session tokens. Minimum 32 characters, or the API refuses to start | 96-character hex string |
| `JWT_EXPIRES_IN` | Session lifetime | `8h` |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` only when serving over HTTPS | `false` locally |
| `TRUST_PROXY` | Number of proxy hops to trust for client IPs | `0` locally, `1` behind one load balancer |
| `BCRYPT_ROUNDS` | Password hashing cost, 10–15 | `12` |
| `LOG_LEVEL` | `fatal`…`trace` | `info` |
| `ADMIN_NAME` | Seeded admin display name | `System Administrator` |
| `ADMIN_EMAIL` | Seeded admin login email | `admin@company.com` |
| `ADMIN_PASSWORD` | Seeded admin password, minimum 8 characters | a strong password |

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `client/.env` — used by the web app

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base path the browser calls | `/api` |
| `VITE_API_PROXY_TARGET` | Where the Vite dev server forwards `/api` | `http://localhost:5000` |

---

## 4. Start the database

```bash
# from the project root
docker compose up -d
docker compose ps
```

Wait until the `etd-postgres` container reports `healthy`. To connect directly:

```bash
docker exec -it etd-postgres psql -U etd_admin -d etd
```

---

## 5. Create the schema and seed data

```bash
cd server
npx prisma migrate deploy   # use "npx prisma migrate dev" when changing the schema
npm run seed
```

The seed is safe to re-run. It creates (or updates) the admin account from `ADMIN_EMAIL` and
`ADMIN_PASSWORD`, plus six sample employees and twelve sample tasks. **Sign in with the
`ADMIN_EMAIL` and `ADMIN_PASSWORD` values from your `server/.env`.**

---

## 6. Run both applications

Use two terminals.

Terminal 1 — API:

```bash
cd server
npm run dev
```

It serves <http://localhost:5000/api> and <http://localhost:5000/api/health>.

Terminal 2 — web app:

```bash
cd client
npm run dev
```

Open <http://localhost:5173>, sign in with the seeded credentials, and the dashboard loads.

---

## 7. Production build

Backend:

```bash
cd server
npm run build     # generates the Prisma client and compiles TypeScript to dist/
npm start         # runs node dist/server.js
```

Frontend:

```bash
cd client
npm run build     # outputs static files to client/dist
npm run preview   # optional local check of the built output
```

Serve `client/dist` from any static host or CDN, and point it at the API.

Change these settings for a production deployment:

| Setting | Production value |
| --- | --- |
| `NODE_ENV` | `production` — hides stack traces and switches to JSON logs |
| `CLIENT_ORIGIN` | The real web app origin, for example `https://console.company.com` |
| `COOKIE_SECURE` | `true`, and serve the app over HTTPS, or the session cookie is rejected |
| `TRUST_PROXY` | The number of proxies in front of the API, so rate limiting sees real client IPs |
| `JWT_SECRET` | A fresh secret, never the development one |
| `ADMIN_PASSWORD` | Rotate after the first sign-in |

Because the session cookie is `SameSite=Strict`, serve the web app and the API from the same
site in production (for example `console.company.com` and `console.company.com/api`).

---

## 8. Useful scripts

Run from `server/`:

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript check, no output files |
| `npm run lint` | ESLint over `src` and `prisma` |
| `npm run format` | Prettier write |
| `npm run prisma:studio` | Opens Prisma Studio to browse the data |
| `npm run prisma:migrate` | Creates and applies a migration after a schema change |
| `npm run prisma:reset` | **Drops all data**, re-applies migrations, then re-seeds |

Run from `client/`:

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | ESLint over `src` |
| `npm run build` | Production build |

To remove the database container and its volume completely:

```bash
docker compose down -v
```

---

## 9. API quick reference

Every route except `POST /api/auth/login` and `GET /api/health` requires the session
cookie, which the login response sets automatically.

| Method | Endpoint | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/login` | `{ email, password }`. Limited to 5 failed attempts per 15 minutes per IP |
| `POST` | `/api/auth/logout` | Clears the session cookie |
| `GET` | `/api/auth/me` | Current admin, used to restore a session on reload |
| `GET` | `/api/employees` | `search`, `department`, `status`, `page`, `limit`, `sortBy`, `order` |
| `POST` | `/api/employees` | Create |
| `GET` | `/api/employees/:id` | One employee with their recent tasks |
| `PUT` | `/api/employees/:id` | Partial update |
| `DELETE` | `/api/employees/:id` | Requires `{ reasonCategory, reasonDetails }`; `reasonDetails` needs 10+ characters |
| `GET` | `/api/employees/departments` | Distinct department names, for filters |
| `GET` | `/api/employees/assignable` | Active employees, for assignment dropdowns |
| `GET` | `/api/employees/deletion-logs` | Paginated removal audit trail |
| `GET` | `/api/tasks` | `search`, `status`, `priority`, `employeeId`, `unassigned`, `overdue`, `dueFrom`, `dueTo`, `page`, `limit`, `sortBy`, `order` |
| `POST` | `/api/tasks` | Create |
| `GET` | `/api/tasks/:id` | One task |
| `PUT` | `/api/tasks/:id` | Partial update, including reassignment |
| `PATCH` | `/api/tasks/:id/status` | `{ status }`; also sets or clears `completedAt` |
| `DELETE` | `/api/tasks/:id` | Delete |
| `GET` | `/api/dashboard/summary` | Counts, overdue totals, workload and recent tasks |

Example session with curl:

```bash
# sign in and save the cookie
curl -c cookie.txt -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@company.com","password":"YOUR_ADMIN_PASSWORD"}'

# use the cookie
curl -b cookie.txt "http://localhost:5000/api/tasks?status=PENDING&priority=HIGH"

# remove an employee, reason required
curl -b cookie.txt -X DELETE http://localhost:5000/api/employees/EMPLOYEE_ID \
  -H 'Content-Type: application/json' \
  -d '{"reasonCategory":"RESIGNED","reasonDetails":"Resigned on 5 Oct 2026, handover complete."}'
```

---

## 10. Troubleshooting

**`Bind for 0.0.0.0:5434 failed: port is already allocated`**
Another Postgres is on that port. Change `POSTGRES_PORT` in the root `.env`, update the port in
`DATABASE_URL` to match, then `docker compose up -d` again.

**`EADDRINUSE: address already in use :::5000`**
Something else holds port 5000. Change `PORT` in `server/.env` and `VITE_API_PROXY_TARGET` in
`client/.env` to match. To find the process on Windows:
`netstat -ano | findstr :5000`.

**`Invalid environment configuration: JWT_SECRET must be at least 32 characters`**
The API validates its environment at startup. Generate a longer secret with the command in
step 3.

**`Can't reach database server at localhost:5434`**
The container is not running or not healthy yet. Check `docker compose ps` and
`docker compose logs postgres`.

**Login succeeds but every other request returns 401**
The session cookie is not being stored. Make sure the web app is opened at
`http://localhost:5173` (the value in `CLIENT_ORIGIN`), not `127.0.0.1`, and that
`COOKIE_SECURE` is `false` for plain HTTP.

**`429 Too many login attempts`**
Five failed sign-ins per IP within 15 minutes trips the limiter. Wait for the window to pass,
or restart the API in development to clear the in-memory counter.

**`@prisma/client did not initialize yet`**
Run `npx prisma generate` in `server/`, which `npm run build` also does.
