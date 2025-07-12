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

- Raspberry Pi OS (Bookworm)
- Debian 12
- A touchscreen connected to the device

### 🛠 Installation Steps

1. Download the `.deb` package:

```bash
wget https://github.com/bc-bjoern/threepics-dashboard/releases/download/v1.0.0/threepics-dashboard_1.0.0.deb
```

2. Install the package:

```bash
sudo dpkg -i threepics-dashboard_1.0.0.deb
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
