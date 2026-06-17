# Backend Checklist — Production Readiness

Backend-only tasks ordered by severity. When all items are done the site is ready to publish.

---

## 🔴 Critical — Core submission pipeline is completely broken

### 1. SubmitHandler: add auth middleware, call AddSolution, return solution_id
**Files:** `internal/services/receiver/routes.go`, `internal/services/receiver/memberHandlers.go`

- [X] Add `middleware.MemberMiddleware` to the `POST /api/submit` route ✅
- [X] After validating the request, call `db.AddSolution(...)` and capture the returned `solutionID` ✅
- [X] Set `solution.ID = solutionID` before publishing to Kafka so the solver can update the right row ✅
- [X] Return `{ "solution_id": solutionID }` in the JSON response so the frontend can poll ✅
- [ ] **Security fix (not yet done):** `db.AddSolution` is currently called with `req.UserID` read
  from the JSON request body — a client can forge any user ID. Extract `userID` from context
  **first**, then pass it to `AddSolution` and override `req.UserID` before marshalling to Kafka:
  ```go
  userID, ok := middleware.GetUserIDFromContext(r.Context())
  if !ok { ... return }
  req.UserID = userID
  solutionID, err := db.AddSolution(req.Compiler, req.Code, req.UserID, req.TaskID)
  ```

**Why:** Without auth middleware, `GetUserIDFromContext` always returns `0, false`, so the user ID
is never attached to the submission. Without calling `AddSolution`, the row never exists in the DB
and the solver's `UpdateSolution` has nothing to update. Without returning `solution_id`, the
frontend polling loop has no ID to poll.

---

### 2. Add GET /api/solutions/:id endpoint
**Files:** `internal/services/receiver/routes.go`, `internal/services/receiver/memberHandlers.go`, `internal/database/solutionFunctions.go`

- [X] Register route `GET /api/solutions/{id}` behind `MemberMiddleware` ✅
- [X] Handler calls `db.GetSolution(id)` ✅
- [X] Return the solution object; frontend checks `status_code` to know when judging is done ✅
- [X] Fixed `GetSolution` scan bug: `&result.ID` was missing (8 columns selected, 7 scanned) ✅
- [X] Fixed NULL panic: `memory`/`time` are NULL while pending — wrapped with `COALESCE(..., 0)` ✅
- [X] Fixed status query: `ErrNoRows` no longer fails the whole call for pending solutions ✅

**Status: Fully implemented and correct.**

---

### 3. Fix solver: load test cases from disk, run per test, compare output, call UpdateSolution
**File:** `internal/services/solver/solverFunction.go`

- [ ] Read test files from the mounted directory `/tests/<taskID>/` — files are named `1.in`,
  `1.out`, `2.in`, `2.out`, …; use `os.ReadDir` to discover them
- [ ] For each test case: bind-mount the `.in` file as stdin (or pipe it) into the judge container
  and capture stdout
- [ ] Compare trimmed stdout against the corresponding `.out` file; track pass/fail count
- [ ] Determine final verdict (`Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`)
- [ ] Call `db.UpdateSolution(solution.ID, verdict, time, memory)` so the row in the DB reflects
  the result
- [ ] Enable captured logs (currently commented out) so errors surface
- [ ] If `/tests/<taskID>/` does not exist or is empty, mark solution as `No Tests` and return

**Why:** `solve()` currently runs the code and returns nothing. `UpdateSolution` is never called,
so `status_code` stays `1` (Pending) forever and the frontend polling loop times out every time.

---

### 4. Fix solver multi-language support
**File:** `internal/services/solver/solverFunction.go`

- [ ] Replace hardcoded `"golang:alpine"` image and `go run` command with a switch on
  `solution.Compiler`:
  - `python` → `python:3.11-alpine`, `["python3", "/usr/src/app/main.py"]`
  - `cpp`    → `gcc:alpine`, compile then run
  - `java`   → `eclipse-temurin:21-alpine`, `["java", "-cp", "/usr/src/app", "Main"]`
  - `go`     → `golang:alpine`, `["go", "run", "/usr/src/app/main.go"]`
- [ ] Fix the `"py "` typo (trailing space) in the filename switch
- [ ] Add the missing `"go"` case so Go code gets the `.go` extension

**Why:** Every submission regardless of language is run as Go code inside a Go container.
Python/C++/Java code fails immediately with a compile or not-found error.

---

### 5. Set up file-based test case storage and mount volume
**Files:** `deploy/docker-compose.yml`, project root

- [ ] Create a `tests/` directory at the repo root (gitignored — contains judge data, not source)
- [ ] Add a named volume or bind mount `./tests:/tests` to **both** the `receiver` and `solver`
  services in `docker-compose.yml`
- [ ] Convention: `tests/<taskId>/1/in.txt`, `tests/<taskId>/1/out.txt`, `2/in.txt`, `2/out.txt`, …
- [ ] No DB table needed — test count can be derived with `os.ReadDir("/tests/<taskId>")` when needed

**Why:** Files are faster (no DB query per submission), handle large inputs without bloating
Postgres, and let the solver bind-mount inputs directly into judge containers. This is the
standard approach used by Codeforces, Polygon, and similar judges.

---

### 6. Add solver service to docker-compose.yml
**File:** `deploy/docker-compose.yml`

- [ ] Add a `solver` service that builds from `./internal/services/solver` (or the root Dockerfile
  with a target stage) and depends on `kafka` and `postgres`
- [ ] Pass the same env vars: `KAFKA_BROKER`, `KAFKA_SUBMISSION_TOPIC`, `POSTGRES_*`
- [ ] Mount Docker socket (`/var/run/docker.sock:/var/run/docker.sock`) so the solver can spin up
  judge containers
- [ ] Set `restart: unless-stopped`

**Why:** The solver binary is compiled but never deployed — there is no service definition for it
in the compose file. No code is ever judged in production.

---

## 🟡 Important — Features visible in the UI but backed by missing endpoints

### 7. Add POST /api/admin/set-lesson-visibility route and handler
**Files:** `internal/services/receiver/routes.go`, `internal/services/receiver/adminHandlers.go`

- [X] Register `POST /api/admin/set-lesson-visibility` behind `AdminMiddleware`
- [X] Handler reads `{ lesson_id: int, open: bool }` from JSON body
- [X] Calls `db.SetLessonVisability(lessonID, open)` (function already exists in
  `lessonFunctions.go`)
- [X] Return `{ success: true }`

**Why:** The ManageLessons UI toggle calls this endpoint. DB function exists; the route does not.

---

### 8. Add POST /api/admin/edit-lesson route and handler
**Files:** `internal/services/receiver/routes.go`, `internal/services/receiver/adminHandlers.go`

- [X] Register `POST /api/admin/edit-lesson` behind `AdminMiddleware`
- [X] Handler reads `{ lesson_id: int, title: string, description: string }` from JSON body
- [X] Calls `db.EditLesson(lessonID, title, description)` (DB function already exists in `lessonFunctions.go`)
- [X] Return `{ success: true }`

**Why:** The ManageLessons edit-lesson form calls this endpoint. No route or handler exists yet.

---

### 9. Fix AdminMiddleware: propagate userID into context
**File:** `internal/middleware/auth.go`

- [X] `context.WithValue` for `userID`, `role`, and `name` — all set before `next.ServeHTTP` ✅

**Status: Done.** `AdminMiddleware` now mirrors `MemberMiddleware` exactly.

---

### 10. Add is_practice to ShortTask and lessons endpoint
**Files:** `internal/models/models.go`, `internal/database/lessonFunctions.go`

- [X] Add `IsPractice bool \`json:"is_practice"\`` to the `ShortTask` struct ✅
- [X] `GetAllLessonsWithTasks` includes `t.is_practice` in `json_build_object` ✅

**Status: Done.**

---

### 11. Fix GetAllLessonsWithTasks: return real per-user completion status
**File:** `internal/database/lessonFunctions.go`

- [X] Replaced squirrel builder with raw SQL — squirrel was generating `$1` with 0 args because
  the subquery placeholder was inside a raw string it couldn't bind ✅
- [X] Subquery LEFT JOINs `solutions` for the requesting `userID` (`$1`) ✅
- [X] `HAVING COUNT(*) > 0` ensures no-solution case returns NULL → COALESCE → 0 (not attempted) ✅
- [X] Returns `status: 2` (Accepted) / `1` (Pending) / `3` (Error) / `0` (not attempted) ✅

**Status: Done.**

---

### 12. Add POST /api/admin/upload-tests/:taskId route and handler
**Files:** `internal/services/receiver/routes.go`, `internal/services/receiver/adminHandlers.go`

**Frontend is fully implemented** — ZIP picker exists in both the add-task form (`ManageLessons.jsx`)
and the edit-task inline form (`TaskItem.jsx`). Both send `multipart/form-data` with `file` and
`task_id` to `POST /api/admin/upload-tests/:taskId`. Only the backend route is missing.

- [X] Register `POST /api/admin/upload-tests/{taskId}` behind `AdminMiddleware` ✅
- [X] Read the ZIP from `r.FormFile("file")` ✅
- [X] Parse the ZIP in memory (`archive/zip`); expected structure inside the ZIP:
  ```
  1/in.txt
  1/out.txt
  2/in.txt
  2/out.txt
  …
  ```
  For each folder `N/` write `in.txt` → `/tasksTests/<taskId>/N/in.txt` and `out.txt` → `/tasksTests/<taskId>/N/out.txt` ✅
- [X] `os.MkdirAll` before writing each pair ✅
- [X] Overwrite any existing tests for that task (full replace semantics — `os.RemoveAll` then re-create) ✅
- [X] Return `{ "success": true, "added": N }` ✅
- [X] Fixed frontend bug: removed manual `Content-Type: multipart/form-data` header from axios calls — boundary was missing, causing server-side parse failure ✅

**Why:** The frontend ZIP upload UI is ready; the backend endpoint is the only missing piece.

---

## 🟠 Bugs — Wrong behavior in deployed code

### 13. Fix Kafka broker address and topic auto-creation
**Files:** `internal/config/kafka.go`, `internal/services/receiver/memberHandlers.go`, `deploy/docker-compose.yml`

- [X] `kafka.go` uses `os.Getenv("KAFKA_BROKER")` (not `KAFKA_ADVERTISED_LISTENERS`) ✅
- [X] `kafka.go` uses `os.Getenv("KAFKA_SUBMISSION_TOPIC")` (not hardcoded `"submissions"`) ✅
- [X] Switched Kafka writer from legacy `kafka.NewWriter(WriterConfig{})` to `&kafka.Writer{}`
  with `AllowAutoTopicCreation: true`, `MaxAttempts: 15`, `WriteTimeout: 30s` ✅
- [X] Added `KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"` to Kafka service in `docker-compose.yml` ✅

**Why:** `KAFKA_ADVERTISED_LISTENERS` includes `PLAINTEXT://` prefix which is not a valid hostname
for DNS lookup. The legacy writer API does not support auto topic creation, causing "Unknown Topic
Or Partition" on first submission. The 30 s write timeout covers the leader election window after
the topic is auto-created.

---

### 14. Fix hardcoded localhost:5173 in email links
**File:** `internal/services/receiver/memberHandlers.go`

- [ ] Replace the hardcoded `http://localhost:5173` in the verification link (line ~84) and the
  password-reset link (line ~192) with `os.Getenv("FRONTEND_URL")`
- [ ] Add `FRONTEND_URL=https://algoboost.foo` to `Docker.env.template`

**Why:** Verification and password-reset emails sent in production contain `localhost:5173` links,
which are unreachable from outside the developer's machine.

---

### 15. Fix Docker.env.template Kafka variable format
**File:** `configs/Docker.env.template`

- [X] Changed Kafka block from YAML-style `KEY: value` to Docker `KEY=value` format ✅

**Why:** Docker `env_file` only parses `KEY=VALUE` lines; colon-separated lines are silently
ignored, so Kafka containers start with no configuration and fail or use defaults.

---

## 🔵 Infrastructure

### 16. Certbot volume paths in docker-compose.yml
**File:** `deploy/docker-compose.yml`

- [X] Certbot service mounts `./letsencrypt` and `./acme` (relative to `deploy/`) ✅
- [X] Nginx service mounts absolute paths `/root/AlgoBoostWebSite/deploy/letsencrypt` and
  `/root/AlgoBoostWebSite/deploy/acme-challenge` — both resolve to the same directories ✅

**Status: Done.** Paths are consistent; TLS renewal will write certs where nginx reads them.

---

### 17. Remove dev CORS origin from production build
**File:** `internal/services/receiver/routes.go` (or wherever CORS is configured)

- [ ] Remove `http://localhost:5173` from allowed origins
- [ ] Set allowed origin to `https://algoboost.foo` (and `www.` variant if needed)
- [ ] Read from `ALLOWED_ORIGINS` env var for flexibility

**Why:** Leaving `localhost:5173` in production CORS headers is a security misconfiguration and
exposes the API to requests from any local dev server running on a visitor's machine.

---

### 18. Configure pgxpool connection limits
**File:** `internal/database/createConnection.go`

- [ ] Set `config.MaxConns`, `config.MinConns`, `config.MaxConnLifetime`, and
  `config.MaxConnIdleTime` (the TODO comment is already there)
- [ ] Reasonable defaults: MaxConns=20, MinConns=2, MaxConnLifetime=1h, MaxConnIdleTime=30m

**Why:** Without pool limits, a traffic spike can exhaust PostgreSQL's `max_connections` (default
100), causing every new request to fail with "connection refused".

---

## 🟢 Security / Polish

### 19. Add rate limiting on auth endpoints
**File:** `internal/services/receiver/routes.go`

- [ ] Add a per-IP rate limiter (e.g., `golang.org/x/time/rate` + middleware, or
  `github.com/ulule/limiter`) on `POST /api/login`, `POST /api/register`, `POST /api/reset-password`
- [ ] Return `429 Too Many Requests` when the limit is exceeded

**Why:** Without rate limiting, these endpoints are trivially brute-forceable and can be used for
credential stuffing or account enumeration.

---

### 20. Normalize email to lowercase in whitelist check and registration
**File:** `internal/utils/auth.go`, `internal/services/receiver/memberHandlers.go`

- [ ] `strings.ToLower(email)` before calling `db.IsEmailWhitelisted(email)` and before
  `db.AddUser(...)` / `db.GetUserByEmail(...)`

**Why:** A user whitelisted as `Alice@School.edu` cannot register as `alice@school.edu` because
the string comparison is case-sensitive. Email addresses are case-insensitive by spec.

---

## Summary

| # | Item | Status |
|---|------|--------|
| 1 | SubmitHandler: auth middleware + AddSolution + return solution_id | ✅ Done (security fix pending) |
| 2 | GET /api/solutions/:id polling endpoint + GetSolution scan fix | ✅ Done |
| 3 | Solver: test case comparison + UpdateSolution | ⏳ Todo |
| 4 | Solver: multi-language Docker images and commands | ⏳ Todo |
| 5 | File-based test storage: tests/ dir + volume mount in compose | ⏳ Todo |
| 6 | Add solver to docker-compose.yml | ⏳ Todo |
| 7 | POST /api/admin/set-lesson-visibility route + handler | ✅ Done |
| 8 | POST /api/admin/edit-lesson route + handler | ⏳ Todo |
| 9 | AdminMiddleware: propagate userID into context | ✅ Done |
| 10 | ShortTask: add is_practice field | ✅ Done |
| 11 | GetAllLessonsWithTasks: real per-user completion status | ✅ Done |
| 12 | POST /api/admin/upload-tests/:taskId route + handler | ✅ Done |
| 13 | Kafka broker address, topic env var, auto-creation writer | ✅ Done |
| 14 | Hardcoded localhost:5173 in email links | ⏳ Todo |
| 15 | Docker.env.template Kafka format (colons → equals) | ✅ Done |
| 16 | Certbot volume paths in docker-compose.yml | ✅ Done |
| 17 | Remove localhost CORS origin from production | ⏳ Todo |
| 18 | Configure pgxpool connection limits | ⏳ Todo |
| 19 | Rate limiting on auth endpoints | ⏳ Todo |
| 20 | Normalize email to lowercase | ⏳ Todo |
