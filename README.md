<div align="center">

# 🚀 gdit

### Git-like Version Control for Google Drive

[![npm version](https://img.shields.io/npm/v/gdit?style=for-the-badge&color=00b4d8)](https://www.npmjs.com/package/gdit)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Stage • Commit • Push to Google Drive**

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Commands](#-commands) •
[How It Works](#-how-it-works) •
[Contributing](#-contributing)

</div>

---

## 🎯 What is gdit?

**gdit** is a command-line tool that brings familiar **Git-like workflows** to **Google Drive**. If you know Git, you already know gdit!

```bash
# Just like Git, but for Google Drive!
gdit add .
gdit commit -m "Add new feature"
gdit push
```

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📦 **Stage & Commit** | Stage files and commit with messages, just like Git |
| 🚀 **Smart Sync** | Only uploads changed files (compares MD5 hashes) |
| ⬇️ **Pull & Clone** | Download files from Drive or clone existing folders |
| 🔍 **Status & Diff** | See what's changed between local and remote |
| 📜 **Commit History** | View your commit log with push status |
| 🎯 **Ignore Files** | Support for `.gditignore` (like `.gitignore`) |
| 🔐 **Secure** | OAuth 2.0 authentication, tokens stored locally |
| 🎨 **Beautiful CLI** | Colorful output with spinners and progress bars |

---

## 📦 Installation

```bash
npm install -g gdit
```

**Requirements:**
- Node.js 18 or higher
- A Google Cloud project (free)

---

## 🚀 Quick Start

### Step 1: Set Up Google Credentials (One-time)

```bash
gdit setup-creds
```

This guides you through creating OAuth credentials. You'll need to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or use existing)
3. Enable the **Google Drive API**
4. Create **OAuth 2.0 credentials** (Desktop app)
5. Copy your **Client ID** and **Client Secret**

### Step 2: Login

```bash
gdit login
```

A browser window opens for Google authentication. After approval, you're ready!

### Step 3: Initialize & Sync

```bash
# Create a new project
mkdir my-project && cd my-project

# Initialize gdit (creates a Drive folder)
gdit init

# Add all files
gdit add .

# Commit your changes
gdit commit -m "Initial commit"

# Push to Google Drive
gdit push
```

🎉 **That's it!** Your files are now synced to Google Drive.

---

## 📋 Commands

### 🔧 Setup Commands

| Command | Description |
|---------|-------------|
| `gdit setup-creds` | Configure Google API credentials (one-time) |
| `gdit login` | Authenticate with Google |
| `gdit logout` | Remove stored tokens |
| `gdit whoami` | Show current user info and storage usage |

### 📁 Repository Commands

| Command | Description |
|---------|-------------|
| `gdit init` | Initialize a new repository (creates Drive folder) |
| `gdit clone <folder-id>` | Clone an existing Drive folder |
| `gdit remote` | Show remote folder info |
| `gdit remote open` | Open Drive folder in browser |

### 📦 Working with Files

| Command | Description |
|---------|-------------|
| `gdit add <files...>` | Stage specific files |
| `gdit add .` | Stage ALL files |
| `gdit rm <files...>` | Unstage files |
| `gdit reset` | Clear the staging area |

### 📝 Commits & Syncing

| Command | Description |
|---------|-------------|
| `gdit commit -m "message"` | Commit staged files |
| `gdit amend -m "message"` | Change last commit message |
| `gdit push` | Push commits to Google Drive |
| `gdit push -f` | Force push ALL files |
| `gdit pull` | Download files from Drive |
| `gdit pull --theirs` | Always use remote version (conflicts) |
| `gdit pull --ours` | Always keep local version (conflicts) |

### 📊 Information

| Command | Description |
|---------|-------------|
| `gdit status` | Show repository status |
| `gdit log` | View commit history |
| `gdit log --files` | Show files in each commit |
| `gdit log -n 5` | Show last 5 commits |
| `gdit diff` | Compare local vs remote files |

---

## 🧠 How It Works

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        YOUR COMPUTER                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   my-project/                    ~/.gdit/                     │
│   ├── .gdit/          ───────►   ├── credentials.json        │
│   │   ├── config.json            └── token.json              │
│   │   ├── stage.json                  (global auth)          │
│   │   ├── commits.json                                        │
│   │   └── remote.json                                         │
│   ├── src/                                                    │
│   │   └── index.ts                                           │
│   └── package.json                                            │
│                                                               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ gdit push / pull
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      GOOGLE DRIVE                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   📁 my-project/                                              │
│   ├── 📄 src/index.ts                                        │
│   └── 📄 package.json                                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Workflow Diagram

```
┌─────────────┐    gdit add     ┌─────────────┐   gdit commit   ┌─────────────┐   gdit push   ┌─────────────┐
│   Working   │ ──────────────► │   Staging   │ ──────────────► │   Commits   │ ────────────► │   Google    │
│  Directory  │                 │    Area     │                 │   (Local)   │               │    Drive    │
└─────────────┘                 └─────────────┘                 └─────────────┘               └─────────────┘
     │                                                                                              │
     │                                              gdit pull                                       │
     │◄──────────────────────────────────────────────────────────────────────────────────────────────
```

### Smart Sync

gdit uses **MD5 checksums** to detect changes:

```bash
$ gdit push

[1/3] Processing src/index.ts...
  ✓ Already up to date: src/index.ts    # Hash matches, skip
[2/3] Processing package.json...
  ✓ Updated: package.json                # Hash differs, upload
[3/3] Processing README.md...
  ✓ Created: README.md                   # New file, create

📊 Push Summary
━━━━━━━━━━━━━━━━━━━━
  ✓ New files:     1
  ↻ Updated:       1
  ○ Skipped:       1
```

---

## 📁 Project Structure

```
gdit/
├── src/                      # TypeScript source code
│   ├── index.ts              # CLI entry point
│   ├── types/                # Type definitions
│   │   └── index.ts          # All TypeScript interfaces
│   ├── core/                 # Core functionality
│   │   ├── config.ts         # Paths and constants
│   │   ├── auth.ts           # Google OAuth
│   │   └── drive.ts          # Drive API operations
│   ├── commands/             # CLI commands
│   │   ├── init.ts           # gdit init
│   │   ├── stage.ts          # gdit add/rm/reset
│   │   ├── commit.ts         # gdit commit/amend
│   │   ├── push.ts           # gdit push
│   │   ├── pull.ts           # gdit pull/clone
│   │   ├── status.ts         # gdit status/log/diff
│   │   └── info.ts           # gdit whoami/remote
│   └── utils/                # Utilities
│       ├── ui.ts             # Terminal output
│       ├── prompts.ts        # User input
│       └── files.ts          # File operations
├── dist/                     # Compiled JavaScript
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # You're reading it!
```

---

## 📝 Ignoring Files

Create a `.gditignore` file in your project root:

```gitignore
# Dependencies
node_modules

# Build output
dist
*.min.js

# IDE
.vscode
.idea

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
```

**Default ignored patterns:**
- `.gdit/` (gdit config)
- `.git/` (git directory)
- `node_modules/`
- Hidden files (starting with `.`)

---

## 🔐 Security

### Where are my credentials stored?

| File | Location | Contains |
|------|----------|----------|
| `credentials.json` | `~/.gdit/` | Your OAuth Client ID & Secret |
| `token.json` | `~/.gdit/` | OAuth access & refresh tokens |

### ⚠️ Important

- **Never share** your `credentials.json` or `token.json`
- Each user must create their **own** OAuth credentials
- Tokens are refreshed automatically when expired

### Revoking Access

To revoke gdit's access to your Google account:
1. Go to [Google Account Security](https://myaccount.google.com/permissions)
2. Find "gdit" in the list
3. Click "Remove Access"

Then locally:
```bash
gdit logout
```

---

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-username/gdit.git
cd gdit

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link for local testing
npm link

# Now you can use `gdit` globally
gdit --version
```

### Development Mode

```bash
# Watch mode - recompiles on changes
npm run dev
```

### Testing

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with these awesome libraries:
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal colors
- [Ora](https://github.com/sindresorhus/ora) - Spinners
- [Boxen](https://github.com/sindresorhus/boxen) - Boxes in terminal
- [Figlet](https://github.com/patorjk/figlet.js) - ASCII art
- [googleapis](https://github.com/googleapis/google-api-nodejs-client) - Google APIs

---

<div align="center">

**Made with ❤️ for developers who love both Git and Google Drive**

[⬆ Back to Top](#-gdit)

</div>