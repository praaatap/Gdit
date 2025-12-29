<div align="center">

# gdit

**Git-like Version Control for Google Drive**

[![npm version](https://img.shields.io/npm/v/gdit?style=flat-square)](https://www.npmjs.com/package/gdit)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)

[Installation](#installation) · [Quick Start](#quick-start) · [Documentation](#documentation) · [Contributing](#contributing)

</div>

---

## About

**gdit** is a command-line tool that brings familiar Git workflows to Google Drive. Stage files, commit changes, and sync to the cloud using commands you already know.

```bash
gdit add .
gdit commit -m "Update documentation"
gdit push
```

### Features

- **Familiar Commands** — Uses Git-style syntax: `init`, `add`, `commit`, `push`, `pull`, `status`, `log`, `diff`
- **Smart Sync** — Only uploads changed files by comparing MD5 checksums
- **Version History** — Maintains commit history with timestamps and messages
- **Selective Staging** — Stage specific files or entire directories
- **Ignore Patterns** — Supports `.gditignore` files (same syntax as `.gitignore`)
- **Cross-Platform** — Works on Windows, macOS, and Linux

---

## Installation

### Windows

**Using the Installer (Recommended)**

Download the latest installer from the [Releases](https://github.com/praaatap/Gdit/releases) page.

**Using Chocolatey**

```bash
choco install gdit
```

**Using Scoop**

```bash
scoop bucket add gdit https://github.com/praaatap/scoop-gdit
scoop install gdit
```

**Using Winget**

```bash
winget install praaatap.gdit
```

### macOS / Linux

**Using Homebrew**

```bash
brew tap praaatap/gdit
brew install gdit
```

### All Platforms

**Using npm**

```bash
npm install -g gdit
```

### Requirements

- Node.js 18.0.0 or higher (for npm installation)
- A Google Cloud project with Drive API enabled

---

## Quick Start

### 1. Configure Google API Credentials

Before using gdit, you need to set up Google API credentials:

```bash
gdit setup-creds
```

Follow the prompts to:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Drive API
3. Create OAuth 2.0 credentials (Desktop application)
4. Enter your Client ID and Client Secret

### 2. Authenticate

```bash
gdit login
```

A browser window will open for Google authentication.

### 3. Initialize a Repository

```bash
mkdir my-project
cd my-project
gdit init
```

### 4. Add and Commit Files

```bash
gdit add .
gdit commit -m "Initial commit"
```

### 5. Push to Google Drive

```bash
gdit push
```

Your files are now synced to Google Drive.

---

## Documentation

### Command Reference

#### Setup

| Command | Description |
|---------|-------------|
| `gdit setup-creds` | Configure Google API credentials |
| `gdit login` | Authenticate with Google |
| `gdit logout` | Remove stored authentication tokens |
| `gdit whoami` | Display current user and storage info |

#### Repository

| Command | Description |
|---------|-------------|
| `gdit init` | Initialize a new repository |
| `gdit clone <folder-id>` | Clone an existing Drive folder |
| `gdit remote` | Show remote folder information |
| `gdit remote open` | Open Drive folder in browser |

#### Working with Files

| Command | Description |
|---------|-------------|
| `gdit add <files...>` | Stage files for commit |
| `gdit add .` | Stage all files |
| `gdit rm <files...>` | Remove files from staging |
| `gdit reset [files...]` | Unstage files |

#### Commits and Syncing

| Command | Description |
|---------|-------------|
| `gdit commit -m "message"` | Commit staged files |
| `gdit amend -m "message"` | Modify the last commit message |
| `gdit push` | Upload commits to Google Drive |
| `gdit push -f` | Force push all files |
| `gdit pull` | Download files from Drive |
| `gdit pull --theirs` | Use remote version for conflicts |
| `gdit pull --ours` | Keep local version for conflicts |

#### Information

| Command | Description |
|---------|-------------|
| `gdit status` | Show repository status |
| `gdit log` | View commit history |
| `gdit log -n <count>` | Show limited commit history |
| `gdit log --files` | Show files in each commit |
| `gdit diff` | Compare local and remote files |

### Ignoring Files

Create a `.gditignore` file in your project root:

```
# Dependencies
node_modules/

# Build output
dist/
build/

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Environment
.env
.env.local
```

Default ignored patterns:
- `.gdit/` — gdit configuration
- `.git/` — Git directory
- `node_modules/` — Node.js dependencies

### How It Works

```
┌─────────────────┐     add      ┌─────────────────┐    commit    ┌─────────────────┐     push     ┌─────────────────┐
│     Working     │ ──────────>  │     Staging     │ ──────────>  │     Commits     │ ──────────>  │  Google Drive   │
│    Directory    │              │      Area       │              │     (Local)     │              │                 │
└─────────────────┘              └─────────────────┘              └─────────────────┘              └─────────────────┘
        │                                                                                                   │
        │                                              pull                                                 │
        │<──────────────────────────────────────────────────────────────────────────────────────────────────│
```

gdit uses MD5 checksums to detect file changes:

```
$ gdit push

[1/3] Processing src/index.ts...
  ✓ Skipped (unchanged)
[2/3] Processing package.json...
  ✓ Updated
[3/3] Processing README.md...
  ✓ Created

Summary: 1 new, 1 updated, 1 skipped
```

---

## Configuration

### Credentials Location

| File | Location | Purpose |
|------|----------|---------|
| `credentials.json` | `~/.gdit/` | OAuth Client ID and Secret |
| `token.json` | `~/.gdit/` | Access and refresh tokens |

### Repository Configuration

Each repository stores its configuration in a `.gdit/` directory:

```
.gdit/
├── config.json    # Repository settings
├── stage.json     # Staged files
├── commits.json   # Commit history
└── remote.json    # Remote folder info
```

---

## Security

### Token Storage

- Credentials are stored locally in your home directory
- Tokens are automatically refreshed when expired
- Never share your `credentials.json` or `token.json` files

### Revoking Access

To revoke gdit's access to your Google account:

1. Visit [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "gdit" and click "Remove Access"
3. Run `gdit logout` locally

---

## Development

### Building from Source

```bash
git clone https://github.com/praaatap/Gdit.git
cd Gdit

npm install
npm run build
npm link
```

### Development Mode

```bash
npm run dev    # Watch mode with auto-recompile
```

### Running Tests

```bash
npm test
```

### Project Structure

```
gdit/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── types/             # TypeScript interfaces
│   ├── core/              # Core functionality
│   │   ├── config.ts      # Paths and constants
│   │   ├── auth.ts        # Google OAuth
│   │   └── drive.ts       # Drive API operations
│   ├── commands/          # CLI commands
│   └── utils/             # Utilities
├── dist/                  # Compiled output
├── packages/              # Package manager manifests
└── installer/             # Windows installer config
```

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

### Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js) — CLI framework
- [googleapis](https://github.com/googleapis/google-api-nodejs-client) — Google APIs client
- [Chalk](https://github.com/chalk/chalk) — Terminal styling
- [Ora](https://github.com/sindresorhus/ora) — Terminal spinners

---

<div align="center">

**[Report a Bug](https://github.com/praaatap/Gdit/issues/new?template=bug_report.md)** · **[Request a Feature](https://github.com/praaatap/Gdit/issues/new?template=feature_request.md)**

</div>