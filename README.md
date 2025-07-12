# Threepics Dashboard

This project is a full-stack photo uploader application

## Project Structure

- `backend/`: Contains the backend server code (Node.js/Express).
- `frontend/`: Contains the frontend client code (React + Vite).
- `node_modules/`: Installed npm packages.
- `package.json`: NPM dependencies and scripts.
- `pnpm-lock.yaml`: Lock file for package versions.
- `requirements.txt`: (Empty or for future use)

## Prerequisites

- Node.js (v18 or newer recommended)
- pnpm package manager
- Python 3 (optional, if backend uses Python)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd threepics-dashboard
```

2. Install backend dependencies:

```bash
cd backend
pnpm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
pnpm install
```

## Running the Project

### Backend

```bash
cd backend
pnpm start
```

or if using node directly:

```bash
node server.js
```

### Frontend

```bash
cd frontend
pnpm dev
```

## Notes

- Ensure you have the necessary environment variables configured if required.
- The backend server handles photo uploads.
- The frontend is built with React and Vite for development and hot reloading.

## Troubleshooting

- If you get missing package errors, run `pnpm install` again in the respective directories.
- Make sure Node.js and pnpm are correctly installed.

```bash
ssh -L 9000:localhost:38329 -L 3000:localhost:3000 -L 8081:localhost:8081 <user>@threepics-dashboard
```

---

© 2025 Björn Becker
