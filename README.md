[![CI](https://github.com/seafoodd/ultiTTT/actions/workflows/deploy.yml/badge.svg)](https://github.com/seafoodd/ultiTTT/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

# ultiTTT

🎮 **ultiTTT** — Competitive real‑time Ultimate Tic Tac Toe

A fully custom‑built Ultimate Tic Tac Toe platform designed for head‑to‑head 1v1 play, with live matchmaking, ranked ladders, and persistent match history.

---

## 🚀 Features

- **Real‑time gameplay**  
  - Bi‑directional updates via WebSockets (socket.io)  
  - Server‑side move validation, disconnect handling, timeouts  
- **Competitive ladder**  
  - ELO‑style ranking  
  - Matchmaking queue for balanced 1v1s  
- **Persistent history & accounts**  
  - Ongoing games in Redis (stateless server design)  
  - Finished matches, player profiles, stats in MongoDB  
- **Responsive, minimal UI**  
  - Built with Vite, React and Tailwind CSS  
  - Focus on speed, clarity, mobile‑friendliness  
- **Robust infrastructure**  
  - Containerized with Docker  
  - CI/CD pipelines (GitHub Actions)  
  - Automated backups for MongoDB  

---

## 🏗 Tech Stack & Architecture

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| **Frontend**  | Next.js, React, Tailwind CSS    |
| **Realtime**  | socket.io (WebSockets)          |
| **Backend**   | NestJS (modular, feature‑based) |
|               | Express.js (legacy API)         |
| **Cache**     | Redis                           |
| **Database**  | MongoDB                         |
| **DevOps**    | Docker, docker‑compose          |
| **CI/CD**     | GitHub Actions                  |
| **Hosting**   | AWS (ECS, RDS, S3, etc.)        |

#### ✅ Note: The new NestJS-based API (in server-v2/) is actively in development. The legacy Express API (server/) remains functional until the migration is complete.
---

## 📥 Getting Started

### 1. Clone the repo

```bash
git clone --branch dev https://github.com/seafoodd/ultiTTT.git
cd ultiTTT
```

### 2. Copy & configure .env files in root, client/, and server-v2/ 

```bash
cp .env.example .env
vim .env
```

Open `.env` and fill in your values

##### if you run the app with docker-compose.dev.yml, then you only need these env variables in server-v2/.env (because other ones will be overwritten):
```env
# Brevo (Sendinblue) API key and sender email
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=no-reply@example.com
```


### 3. Development with Docker

Bring up all services:

```bash
docker‑compose ‑f docker‑compose.dev.yml up --build
```

* **client** on `http://localhost:5173`
* **server** on `http://localhost:5000`
* **server-v2** on `http://localhost:5001`

### 4. Running Locally without Docker (optional)

#### Frontend

```bash
cd client
npm install
npm run dev
```

#### Backend
old api:
```bash
cd server
npm install
npm run dev
```
v2 api:
```bash
cd server-v2
pnpm install
pnpm run start:dev
```
##### (you'll also have to set up mongodb and redis, i used docker for them before)
---

## 📦 Production

1. Build containers:

   ```bash
   docker‑compose build
   ```
2. Start in detached mode:

   ```bash
   docker‑compose up ‑d
   ```
3. Check logs:

   ```bash
   docker‑compose logs ‑f
   ```

Database backups are managed automatically via the scripts in the `scripts/` directory and run with cron.

---

## 🛠 CI/CD & Backups
**GitHub Actions** workflows live in `.github/workflows/`

On each push to `main`, we:
  1. Run tests
  2. Deploy to DigitalOcean droplet

---

## 🤝 Contributing

1. Fork the repo
2. Create a topic branch (`git checkout -b feature/awesome`)
3. Commit your changes & push
4. Open a Pull Request against `dev`
5. Ensure all GitHub Actions pass
