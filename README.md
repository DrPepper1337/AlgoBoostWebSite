# AlgoBoost Website

We are a St Andrews Universiy student-led society, commited to helping our peers improve their technocal interview skills. This project is our members-only platform, providing access to our DSA lessons and practice questions.

## How to Run - Development

1. Make sure you have the latest version of Docker Desktop Running
2. Make sure your `.env` is up to date
3. Build the static files:
   1. From the root directory of the project, go to `frontend/`
   2. Run `npm install`
   3. Run `npm run build`
4. Run `docker compose -f deploy/docker-compose.dev.yml up --build`
5. The website should be accessible via `http://localhost/` on your machine
