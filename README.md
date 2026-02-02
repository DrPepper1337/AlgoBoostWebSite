# AlgoBoost Website

We are a St Andrews Universiy student-led society, commited to helping our peers improve their technocal interview skills. This project is our members-only platform, providing access to our DSA lessons and practice questions.

## How to Run - Development

1. Make sure you have the latest version of Docker Desktop Running
2. Make sure your `.env` is up to date
3. Run `docker compose -f deploy/docker-compose.dev.yml up --build`
4. The website should be accessible via `http://localhost/8088` on your machine

## Ports - Development

- `8088` = Nginx. proxies `/` to the Vite dev server (frontend hot-reload) and `/api/` to receiver
- `5173` = Vite dev server in the frontend container, hot-reload, but bypasses Nginx
- `8080` = receiver API service
- `5432` = Postgres
- `9092` = Kafka broker

## How to run lint

To run lint for the entire codebase run:

```bash
make lint
```

To run lint for just backend run:

```bash
make lint-go
```

To run lint for just frontend run:

```bash
make lint-js
```

## How to test

Our extensive testing suite is located in the `tests/` directory. They run as part of CI/CD. To run them locally, do the followig:

1. Make sure backend / the app is running (`docker compose -f deploy/docker-compose.dev.yml up`)
2. Run tests in all subdirs of the project: `go test ./..`
3. Run specific test files: `go test tests/database/postgres_test.go`
