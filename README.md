## ✨ Honeygain Auto Daily Claim → Discord

[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](#-nodejs-version-nodejs)
[![Python >= 3.9](https://img.shields.io/badge/python-%3E%3D3.9-3776AB?logo=python&logoColor=white)](#-python-version-python)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](#-license)

Automates Honeygain's daily reward and posts a clean, rich Discord embed. Sends the ping in a separate message to keep the embed tidy. Two implementations are provided:
- `nodejs/` (Node.js v18+)
- `python/` (Python 3.9+)

### 🚀 Features
- Claims the daily reward with `https://dashboard.honeygain.com/api/v1/contest_winnings`
- Waits 5 seconds so totals update
- Fetches totals from `https://dashboard.honeygain.com/api/v1/earnings/jt`
- Sends a Discord embed with credits, totals, USD, time, endpoint, status
- Sends a separate ping message (optional)

### 📦 Tech
- Node.js 18+ (global fetch) or Python 3.9+
- Discord webhook (no bot needed)

---

## 🧭 Table of contents
- [Features](#-features)
- [Tech](#-tech)
- [Quick start](#-quick-start-copy--paste)
- [Environment variables](#-environment-variables)
- [How to get your HONEYGAIN_TOKEN](#-how-to-get-your-honeygain_token)
- [Node.js](#-nodejs-version-nodejs)
- [Python](#-python-version-python)
- [Notes](#-notes)
- [Scheduling](#-scheduling)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)
- [Support / Donate](#-support--donate)
- [License](#-license)

---

## ⚡ Quick start (copy & paste)
### Node.js
```powershell
cd nodejs
npm ci
$env:HONEYGAIN_TOKEN="your_jwt_here"
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/XXX/YYY"
$env:PING_MESSAGE="@everyone"
node honeygain.js
```

### Python
```powershell
cd python
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
$env:HONEYGAIN_TOKEN="your_jwt_here"
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/XXX/YYY"
$env:PING_MESSAGE="@everyone"
python honeygain.py
```

---

## 🔐 Environment variables
Required:
- `HONEYGAIN_TOKEN`: Your Honeygain JWT token

Optional:
- `DISCORD_WEBHOOK_URL`: Discord webhook URL
- `PING_MESSAGE`: e.g. `@everyone` or `<@USER_ID>`; if empty, no ping is sent

You can set these via a `.env` file in each folder or directly in your shell session.

| Name | Required | Example |
|------|----------|---------|
| `HONEYGAIN_TOKEN` | Yes | `eyJhbGciOi...` |
| `DISCORD_WEBHOOK_URL` | No | `https://discord.com/api/webhooks/XXX/YYY` |
| `PING_MESSAGE` | No | `@everyone` or `<@123456789012345678>` |

Example `.env` for both Node and Python:
```
HONEYGAIN_TOKEN=your_jwt_here
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
PING_MESSAGE=<@!422093143857561601>
```

---

## 🔑 How to get your HONEYGAIN_TOKEN
1. Open `https://dashboard.honeygain.com` in a desktop browser and log in.
2. Open DevTools → Network tab.
3. Click somewhere in the app or refresh so requests appear.
4. Select any API request to `dashboard.honeygain.com`.
5. In the request headers, find `Authorization: Bearer <TOKEN>`.
6. Copy the token (everything after `Bearer `) and set it as `HONEYGAIN_TOKEN`.

Security notes:
- Do not share this token. Treat it like a password.
- Prefer using a `.env` file and keep it out of source control.

---

## 🟩 Node.js version (`nodejs/`)
### Requirements
- Node.js 18 or newer (uses global fetch)

### Install
No packages to install other than `dotenv` (already in `package.json`). If you need to install:
```powershell
cd nodejs
npm ci
```

### Run (Windows PowerShell)
Using environment variables in-session:
```powershell
cd nodejs
$env:HONEYGAIN_TOKEN="your_jwt_here"
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/XXX/YYY"
$env:PING_MESSAGE="@everyone"
node honeygain.js
```

Or via npm scripts:
```powershell
cd nodejs
npm start
# or during development with reload
npm run dev
```

---

## 🐍 Python version (`python/`)
### Requirements
- Python 3.9+

### Install
```powershell
cd python
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

### Run (Windows PowerShell)
Using environment variables in-session:
```powershell
cd python
$env:HONEYGAIN_TOKEN="your_jwt_here"
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/XXX/YYY"
$env:PING_MESSAGE="@everyone"
python honeygain.py
```

---

## 📝 Notes
- The ping is sent as a separate Discord message so the embed stays clean.
- If `DISCORD_WEBHOOK_URL` is not set, output falls back to console.
- The script waits 5 seconds before fetching totals to ensure they reflect the just-claimed reward.

### ⏰ Scheduling
- Windows: Use Task Scheduler to run the Node or Python command daily.
- Linux: Use cron, e.g. `0 12 * * * cd /path/to/nodejs && HONEYGAIN_TOKEN=... node honeygain.js`.

---

## 📷 Screenshots

> Example Discord messages (embed + separate ping)

![Success example, will be added tomorrow.](docs/discord-ping.png)

Failure example:
![Failure example](https://sharex.blackforthosting.com/YdFQ)

---

## ❓ Troubleshooting
- 401/403 from Honeygain: Token expired/invalid. Reacquire `HONEYGAIN_TOKEN`.
- 429 rate limit: Wait and try later.
- Webhook 404/401: Check `DISCORD_WEBHOOK_URL` and that it wasn't deleted/reset.
- No embed in Discord: Ensure you POST JSON with `embeds`, and the webhook URL is correct.

---

## ❤️ Support / Donate
If this saves you time, consider supporting:

[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?logo=paypal&logoColor=white)](https://paypal.me/@ppblackforthosting)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/itsjustnickdev)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-donate-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/itsjustnickdev)

---

## 📄 License
AGPL-3.0-only — see `LICENSE`

---

## 📫 Contact
For electronic mail, contact: `nick@drops-it.com`.
For paper mail, please reach out via email to request a postal address.

---

## 🙌 Credits
Created by [itsjustnickdev](https://buymeacoffee.com/itsjustnickdev) · Support via
[PayPal](https://paypal.me/@ppblackforthosting),
[Buy Me a Coffee](https://buymeacoffee.com/itsjustnickdev),
or [Ko‑fi](https://ko-fi.com/itsjustnickdev).
