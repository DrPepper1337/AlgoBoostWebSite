# Project

AlgoBoost is a St Andrews University student-led society platform. This project serves as a members-only web application designed to help peers improve their technical interview skills by providing access to Data Structures and Algorithms (DSA) lessons and practice questions.

## Technology
- **Backend:** Go 1.23+ with `go-chi` (routing), `pgx` and `squirrel` (PostgreSQL), `segmentio/kafka-go` (Kafka), `zap` (logging).
- **Frontend:** React 19, Vite, TailwindCSS v4, React Router, Axios.
- **Infrastructure:** Docker, Nginx, PostgreSQL, Kafka.

## Important folders
- `frontend/` - React frontend application source code.
- `cmd/` - Backend Go application entry points.
- `internal/` - Backend internal packages and business logic.
- `tests/` - Extensive Go testing suite.
- `deploy/` - Docker Compose configuration files (`docker-compose.dev.yml`).
- `nginx/` - Nginx configuration and reverse proxy settings.

## Implementation rules

- Prefer the smallest change that solves the requested problem.
- Reuse existing components and design tokens before adding new ones.
- Do not introduce a dependency without explaining why it is needed.
- Preserve loading, empty, error, disabled, and success states.
- Never open, print, or modify `.env` files or credentials.
- Ask before changing authentication, database rules, or deployment settings
- With each implementation provide a file by file description of what you did so I can learn

- Do not have files more than 700 lines long and functions more than 100 lines long

## Verification
- **Linting:** Run `make lint` for the entire codebase, or `make lint-go` / `make lint-js` for backend/frontend individually.
- **Testing:** Start the environment via `docker compose -f deploy/docker-compose.dev.yml up --build` and run `go test ./...` to execute the test suite.

