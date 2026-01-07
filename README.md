<h1 align="center">Gdit</h1>

<p align="center">
  <strong>🚀 Git-like version control for Google Drive</strong><br>
  Stage, commit, and sync files using familiar Git commands
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/gdit"><img src="https://img.shields.io/npm/v/gdit.svg?style=flat-square&color=4285F4" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/gdit"><img src="https://img.shields.io/npm/dm/gdit.svg?style=flat-square&color=34A853" alt="npm downloads"></a>
  <a href="https://github.com/praaatap/gdit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-FBBC04.svg?style=flat-square" alt="license"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-EA4335.svg?style=flat-square" alt="node version"></a>
</p>

---

## ✨ Features

- **🔄 Git-like Workflow** — Use familiar commands: `init`, `add`, `commit`, `push`, `pull`
- **☁️ Google Drive Integration** — Secure OAuth 2.0 authentication with your Google account
- **⚡ Smart Sync** — Only uploads changed files using MD5 hash comparison
- **📦 Clone Folders** — Clone existing Google Drive folders to local
- **🔀 Conflict Resolution** — Choose `--theirs`, `--ours`, or interactive resolution
- **📊 Beautiful CLI** — Colorful output with spinners, progress bars, and status badges
- **📝 Commit History** — Track changes with push status and timestamps
- **🗂️ .gditignore** — Exclude files and folders from tracking

---

## 📦 Installation

```bash
npm install -g gdit
```

### Prerequisites
- Node.js 18.0.0 or higher
- A Google Cloud account for API credentials

---

## 🚀 Quick Start

### 1. Setup Credentials

First, get your Google OAuth 2.0 credentials:

```bash
gdit setup-creds
```

Follow the instructions to:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project and enable the **Google Drive API**
3. Create **OAuth 2.0 Client ID** (Desktop app)
4. Enter your Client ID and Client Secret

### 2. Login

```bash
gdit login
```

A browser window will open for authentication. Once complete, you're ready to go!

### 3. Initialize & Push

```bash
# Create a new repository linked to Google Drive
gdit init

# Stage files
gdit add .

# Commit changes
gdit commit -m "Initial commit"

# Push to Google Drive
gdit push
```

### 4. Clone Existing Folder

```bash
# Clone a folder from Google Drive using its folder ID
gdit clone <folder-id>
```

---

## 📖 Commands

| Command | Description |
|---------|-------------|
| `gdit setup-creds` | Configure your Google API credentials |
| `gdit login` | Authenticate with your Google account |
| `gdit logout` | Remove stored authentication tokens |
| `gdit whoami` | Show current user info and storage quota |
| `gdit init` | Initialize a new repository |
| `gdit clone <id>` | Clone an existing Google Drive folder |
| `gdit add <files>` | Stage files for commit |
| `gdit rm <files>` | Remove files from staging area |
| `gdit reset [files]` | Unstage files |
| `gdit commit -m "msg"` | Commit staged files with a message |
| `gdit amend -m "msg"` | Amend the last commit message |
| `gdit push` | Push commits to Google Drive |
| `gdit push -f` | Force push all committed files |
| `gdit pull` | Pull files from Google Drive |
| `gdit pull --theirs` | Pull and always use remote version |
| `gdit pull --ours` | Pull and keep local version |
| `gdit pull --dry-run` | Show what would be pulled |
| `gdit status` | Show repository status |
| `gdit log` | Show commit history |
| `gdit log -n 5` | Show last 5 commits |
| `gdit log --files` | Show files in each commit |
| `gdit diff` | Compare local files with remote |
| `gdit remote` | Show remote repository info |

---

## ⚙️ Configuration

### .gditignore

Create a `.gditignore` file to exclude files and folders:

```
# Dependencies
node_modules/

# Build output
dist/
build/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
```

### Default Ignored Patterns

The following are always ignored:
- `.gdit/` — Local gdit config
- `.git/` — Git directory
- `node_modules/` — Node dependencies
- `.DS_Store`, `Thumbs.db` — OS files
- `*.log` — Log files

---

## 🏗️ Architecture

```
src/
├── commands/     # CLI command handlers (init, push, pull, etc.)
├── core/         # Core functionality (auth, drive, config)
├── types/        # TypeScript type definitions
├── utils/        # Utility functions (UI, files, prompts)
└── index.ts      # Main entry point
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🔒 Security

For security concerns, please see our [Security Policy](SECURITY.md).

## 📄 License

MIT © [gdit contributors](LICENSE)

---

<p align="center">
  <sub>Built with ❤️ for developers who love Git and Google Drive</sub>
</p>
