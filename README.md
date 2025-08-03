# Threepics Dashboard 📸

A digital photo frame project – built as a full-stack web application.  
**Automatically installable via Debian package**.  
Tested on Raspberry Pi OS (Raspberry Pi OS Bookworm / Debian 12).

## ✨ Features

- Multiple Subaccounts — Ideal for family members to manage their own uploads
- Media Upload — Upload images and videos (optionally with subtitles) via web portal or Telegram bot
- Smooth Transition Effects — Various animations between slides
- Configurable Settings — Adjust delay, transition duration, language, and more
- Language Support — German 🇩🇪 and English 🇬🇧
- Touch Navigation — Tap the screen to skip to the next image
- Explore all features on three-pics.com

## 🛠️ Currently in Development

- Custom 3D-printed frames for touchscreen devices
---

## 📦 Installation via Debian Package

The latest `.deb` package is available on GitHub Releases:

👉 [Download threepics-dashboard_v1.0.0.deb](https://github.com/bc-bjoern/threepics-dashboard/releases/tag/v1.0.0)

### ✅ Requirements

This has been tested on:

- Raspberry Pi OS Lite (Bookworm)
- Debian 12
- A touchscreen connected to the device

### 🛠 Installation Steps via Debian Package

1. Download the `.deb` package:

```bash
wget https://github.com/bc-bjoern/threepics-dashboard/releases/download/v1.0.0/threepics-dashboard_v1.0.0.deb
```

2. Install the package:

```bash
sudo dpkg -i threepics-dashboard_1.0.0.deb
```

### Install Threepics Dashboard via Debian Repository 

```bash
# Import public GPG key
curl -fsSL https://deb.three-pics.com/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/threepics.gpg > /dev/null

# Add repository
echo "deb [signed-by=/usr/share/keyrings/threepics.gpg arch=armhf] https://deb.three-pics.com stable main" | sudo tee /etc/apt/sources.list.d/threepics.list

# Update and install
sudo apt update
sudo apt install threepics-dashboard
```


3. (Optional) Fix missing dependencies:

```bash
sudo apt-get install -f
```

4. Reboot the device:

```bash
sudo reboot
```

---

## 🖥 Usage

After reboot:

- The application launches automatically on the connected screen.
- In the upper middle of the screen, tap to open the **Setup** panel.
- Under the **Login tab**, enter your email and password from [three-pics.com](https://three-pics.com).

You need a valid account on three-pics.com to use this dashboard.

---

## 🔧 Developer Structure

For developers working with the source:

```
.
├── backend/        # Node.js/Express API server
├── frontend/       # React + Vite single-page application
├── setup/          # DEBIAN package build structure
├── scripts/        # Python sync utilities
└── config/         # JSON-based local credentials + settings
```

## Troubleshooting

- If you get missing package errors, run pnpm install again in the respective directories.
- Make sure Node.js and pnpm are correctly installed.

## Developer hint 

SSH tunnel for the win

``` bash
ssh -L 9000:localhost:38329 -L 3000:localhost:3000 -L 8081:localhost:8081 <user>@threepics-dashboard
```

open localhost:9000

## 🧑‍💻 Developer Setup (Docker-based)

To run the fullstack app locally using Docker, follow these steps:

### 🔧 Requirements

- [Docker](https://www.docker.com/) installed
- [Docker Compose](https://docs.docker.com/compose/) available

### 🚀 Start the Project

Use the included script to:

- Safely remove `node_modules` from `frontend/` and `backend/` (if they exist)
- Build all containers from scratch
- Start the backend and frontend together

```bash
./run_docker.sh
```

This ensures a clean environment and prevents issues from architecture mismatches or leftover dependencies.

### 🌐 Access the App

- **Frontend (Vite Dev Server):**
  The frontend runs on a random port (e.g. `http://localhost:38329`).
  Check the container logs for the actual URL after startup.

- **Backend (API):**
  Runs on: [http://localhost:3000](http://localhost:3000)

### 🧹 Cleaning Up

To stop everything and remove volumes:

```bash
docker compose down --volumes
```

---

💡 Tip: You can extend `run_docker.sh` with flags or environment variables to switch between development and production setups.

---

## ⚠️ Status: Alpha

This project is still under heavy development and testing.  
**Please do not use yet.**

---

## 💬 Contact

Developed by **Björn Becker**  
GitHub: [bc-bjoern](https://github.com/bc-bjoern)

---

© 2025 Björn Becker
