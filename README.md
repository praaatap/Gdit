<div align="center">

<!-- Animated Header -->
<a href="https://github.com/praaatap/Gdit">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=gdit&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Git-like%20Version%20Control%20for%20Google%20Drive&descSize=20&descAlignY=55" width="100%" alt="gdit header"/>
</a>

<br/>

<!-- Animated Badges Row 1 -->
<p>
  <a href="https://www.npmjs.com/package/gdit">
    <img src="https://img.shields.io/npm/v/gdit?style=for-the-badge&logo=npm&logoColor=white&color=CB3837&labelColor=1a1a2e" alt="npm version"/>
  </a>
  <a href="https://www.npmjs.com/package/gdit">
    <img src="https://img.shields.io/npm/dm/gdit?style=for-the-badge&logo=npm&logoColor=white&color=4CAF50&labelColor=1a1a2e" alt="npm downloads"/>
  </a>
  <a href="https://github.com/praaatap/Gdit/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=opensourceinitiative&logoColor=white&labelColor=1a1a2e" alt="License"/>
  </a>
</p>

<!-- Animated Badges Row 2 -->
<p>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1a1a2e" alt="TypeScript"/>
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=1a1a2e" alt="Node.js"/>
  </a>
  <a href="https://developers.google.com/drive">
    <img src="https://img.shields.io/badge/Google%20Drive-API%20v3-4285F4?style=for-the-badge&logo=googledrive&logoColor=white&labelColor=1a1a2e" alt="Google Drive API"/>
  </a>
</p>

<!-- CI/CD Status Badges -->
<p>
  <a href="https://github.com/praaatap/Gdit/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/praaatap/Gdit/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=CI&labelColor=1a1a2e" alt="CI Status"/>
  </a>
  <a href="https://github.com/praaatap/Gdit/releases">
    <img src="https://img.shields.io/github/v/release/praaatap/Gdit?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e&color=blueviolet" alt="Release"/>
  </a>
  <a href="https://github.com/praaatap/Gdit/stargazers">
    <img src="https://img.shields.io/github/stars/praaatap/Gdit?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e&color=gold" alt="Stars"/>
  </a>
</p>

<!-- Quick Links -->
<h3>
  <a href="#-installation">Installation</a>
  <span> | </span>
  <a href="#-quick-start">Quick Start</a>
  <span> | </span>
  <a href="#-commands">Commands</a>
  <span> | </span>
  <a href="#-documentation">Docs</a>
  <span> | </span>
  <a href="#-contributing">Contributing</a>
</h3>

<br/>

<!-- Typing Animation -->
<a href="https://github.com/praaatap/Gdit">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=00D9FF&center=true&vCenter=true&multiline=true&repeat=false&random=false&width=600&height=60&lines=Stage%2C+Commit%2C+and+Sync+to+Google+Drive;Using+the+Git+Commands+You+Already+Know" alt="Typing SVG"/>
</a>

</div>

---

<br/>

## What is gdit?

**gdit** is a powerful command-line tool that brings the familiar Git workflow to Google Drive. If you know Git, you already know gdit. Stage your files, commit changes with meaningful messages, and push everything to the cloud - all from your terminal.

```bash
# It's this simple
gdit add .
gdit commit -m "Update project files"
gdit push
```

<br/>

<div align="center">

### Why Choose gdit?

</div>

<table>
<tr>
<td width="33%" align="center">
<h4>Familiar Workflow</h4>
<p>Uses Git-style commands you already know: <code>init</code>, <code>add</code>, <code>commit</code>, <code>push</code>, <code>pull</code></p>
</td>
<td width="33%" align="center">
<h4>Smart Syncing</h4>
<p>Only uploads changed files using MD5 checksum comparison for maximum efficiency</p>
</td>
<td width="33%" align="center">
<h4>Cross-Platform</h4>
<p>Works seamlessly on Windows, macOS, and Linux with native installers</p>
</td>
</tr>
<tr>
<td width="33%" align="center">
<h4>Version History</h4>
<p>Maintains complete commit history with timestamps, messages, and file tracking</p>
</td>
<td width="33%" align="center">
<h4>Ignore Patterns</h4>
<p>Supports <code>.gditignore</code> files with the same syntax as <code>.gitignore</code></p>
</td>
<td width="33%" align="center">
<h4>Secure Auth</h4>
<p>Uses OAuth 2.0 with your own Google Cloud credentials for maximum security</p>
</td>
</tr>
</table>

<br/>

---

<br/>

## Installation

<details open>
<summary><h3>Windows</h3></summary>

#### Recommended: Windows Installer

Download the latest installer from the <a href="https://github.com/praaatap/Gdit/releases"><strong>Releases Page</strong></a>

#### Package Managers

<table>
<tr>
<td><strong>Chocolatey</strong></td>
<td>

```bash
choco install gdit
```

</td>
</tr>
<tr>
<td><strong>Scoop</strong></td>
<td>

```bash
scoop bucket add gdit https://github.com/praaatap/scoop-gdit
scoop install gdit
```

</td>
</tr>
<tr>
<td><strong>Winget</strong></td>
<td>

```bash
winget install praaatap.gdit
```

</td>
</tr>
</table>

</details>

<details>
<summary><h3>macOS / Linux</h3></summary>

#### Homebrew

```bash
brew tap praaatap/gdit
brew install gdit
```

</details>

<details>
<summary><h3>All Platforms (npm)</h3></summary>

```bash
npm install -g gdit
```

> **Requires:** <a href="https://nodejs.org/">Node.js</a> 18.0.0 or higher

</details>

<br/>

---

<br/>

## Quick Start

### Step 1: Set Up Google API Credentials

Before using gdit, you need to configure your Google Cloud credentials:

```bash
gdit setup-creds
```

<details>
<summary><strong>Click here for detailed setup instructions</strong></summary>

<br/>

1. Visit the <a href="https://console.cloud.google.com/apis/credentials"><strong>Google Cloud Console</strong></a>
2. Create a new project or select an existing one
3. Enable the <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com"><strong>Google Drive API</strong></a>
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Set Application type to **Desktop app**
6. Copy the **Client ID** and **Client Secret**
7. Enter them when prompted by `gdit setup-creds`

</details>

### Step 2: Authenticate

```bash
gdit login
```

A browser window will open for Google authentication. Approve the access and you're ready!

### Step 3: Initialize Your Repository

```bash
mkdir my-project
cd my-project
gdit init
```

### Step 4: Add and Commit Files

```bash
gdit add .
gdit commit -m "Initial commit"
```

### Step 5: Push to Google Drive

```bash
gdit push
```

Your files are now synced to Google Drive!

<br/>

---

<br/>

## Commands

<div align="center">

### Complete Command Reference

</div>

### Authentication and Setup

| Command | Description |
|:--------|:------------|
| `gdit setup-creds` | Configure your Google API credentials |
| `gdit login` | Authenticate with your Google account |
| `gdit logout` | Remove stored authentication tokens |
| `gdit whoami` | Display current user info and storage quota |

### Repository Management

| Command | Description |
|:--------|:------------|
| `gdit init` | Initialize a new gdit repository |
| `gdit clone <folder-id>` | Clone an existing Google Drive folder |
| `gdit remote` | Show remote folder information |
| `gdit remote open` | Open the Drive folder in your browser |

### File Operations

| Command | Description |
|:--------|:------------|
| `gdit add <files...>` | Stage specific files for commit |
| `gdit add .` | Stage all files in the current directory |
| `gdit rm <files...>` | Remove files from the staging area |
| `gdit reset [files...]` | Unstage files without deleting them |

### Commits and Syncing

| Command | Description |
|:--------|:------------|
| `gdit commit -m "message"` | Commit staged files with a message |
| `gdit amend -m "message"` | Modify the last commit message |
| `gdit push` | Upload commits to Google Drive |
| `gdit push -f` | Force push all files (overwrites remote) |
| `gdit pull` | Download files from Google Drive |
| `gdit pull --theirs` | Use remote version for all conflicts |
| `gdit pull --ours` | Keep local version for all conflicts |

### Information and Diff

| Command | Description |
|:--------|:------------|
| `gdit status` | Show repository and staging status |
| `gdit log` | View full commit history |
| `gdit log -n <count>` | Show limited number of commits |
| `gdit log --files` | Show files changed in each commit |
| `gdit diff` | Compare local files with remote versions |

### Fun Commands

| Command | Description |
|:--------|:------------|
| `gdit art <text>` | Generate ASCII art from any text |

<br/>

---

<br/>

## Documentation

### How gdit Works

<div align="center">

```
+-----------------+    add     +-----------------+   commit   +-----------------+    push    +-----------------+
|     Working     | ---------> |     Staging     | ---------> |     Commits     | ---------> |  Google Drive   |
|    Directory    |            |      Area       |            |     (Local)     |            |     (Cloud)     |
+-----------------+            +-----------------+            +-----------------+            +-----------------+
        ^                                                                                            |
        |                                         pull                                               |
        |<-------------------------------------------------------------------------------------------|
```

</div>

### Ignoring Files

Create a `.gditignore` file in your project root to exclude files from syncing:

```gitignore
# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
*.exe

# IDE and editor files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Environment and secrets
.env
.env.local
*.key
```

**Default ignored patterns:**
- `.gdit/` - gdit configuration directory
- `.git/` - Git directory
- `node_modules/` - Node.js dependencies

### Smart Sync with MD5 Checksums

gdit uses MD5 checksums to detect file changes, ensuring only modified files are uploaded:

```
$ gdit push

[1/4] Processing src/index.ts...
  [SKIP] Unchanged
[2/4] Processing package.json...
  [UPDATE] Modified
[3/4] Processing README.md...
  [NEW] Created
[4/4] Processing src/utils.ts...
  [SKIP] Unchanged

Summary: 1 new, 1 updated, 2 skipped
```

### Configuration Files

#### Global Configuration (`~/.gdit/`)

| File | Purpose |
|:-----|:--------|
| `credentials.json` | Your OAuth Client ID and Secret |
| `token.json` | Access and refresh tokens |

#### Repository Configuration (`.gdit/`)

| File | Purpose |
|:-----|:--------|
| `config.json` | Repository settings |
| `stage.json` | Currently staged files |
| `commits.json` | Local commit history |
| `remote.json` | Remote folder information |

<br/>

---

<br/>

## Project Architecture

```
gdit/
|-- src/
|   |-- index.ts              # CLI entry point and command registration
|   |-- types/                # TypeScript type definitions
|   |   |-- index.ts          # Exported interfaces and types
|   |   |-- drive.ts          # Google Drive API types
|   |-- core/                 # Core functionality
|   |   |-- config.ts         # Paths, constants, and configuration
|   |   |-- auth.ts           # Google OAuth authentication
|   |   |-- drive.ts          # Google Drive API operations
|   |-- commands/             # CLI command handlers
|   |   |-- init.ts           # Repository initialization
|   |   |-- stage.ts          # File staging (add, rm, reset)
|   |   |-- commit.ts         # Commit operations
|   |   |-- push.ts           # Push to Google Drive
|   |   |-- pull.ts           # Pull from Google Drive
|   |   |-- status.ts         # Repository status
|   |   |-- info.ts           # Log, diff, whoami, remote
|   |-- utils/                # Utility functions
|       |-- files.ts          # File system operations
|       |-- ui.ts             # Terminal UI (colors, spinners)
|       |-- prompts.ts        # User input prompts
|-- packages/                 # Package manager manifests
|   |-- chocolatey/           # Chocolatey package
|   |-- scoop/                # Scoop manifest
|   |-- winget/               # Winget manifest
|   |-- homebrew/             # Homebrew formula
|-- installer/                # Windows installer configuration
|-- .github/
|   |-- workflows/            # CI/CD GitHub Actions
|   |-- ISSUE_TEMPLATE/       # Issue templates
|-- dist/                     # Compiled JavaScript output
```

<br/>

---

<br/>

## Security

### OAuth 2.0 Authentication

gdit uses your own Google Cloud credentials, ensuring:
- **Full Control**: You own and manage your OAuth application
- **Privacy**: No third party has access to your tokens
- **Revocable**: Access can be revoked anytime from your <a href="https://myaccount.google.com/permissions">Google Account</a>

### Minimal Permissions

gdit only requests the minimum necessary scopes:
- `drive.file` - Access only to files created by gdit
- `userinfo.email` - Display your email address
- `userinfo.profile` - Display your name

### Best Practices

1. **Never share credentials** - Keep `~/.gdit/credentials.json` and `~/.gdit/token.json` private
2. **Use .gditignore** - Exclude sensitive files from syncing
3. **Update regularly** - Install the latest version for security patches
4. **Revoke when needed** - Remove access via <a href="https://myaccount.google.com/permissions">Google Account Permissions</a>

> For security vulnerabilities, please refer to our <a href="SECURITY.md"><strong>Security Policy</strong></a>

<br/>

---

<br/>

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/praaatap/Gdit.git
cd Gdit

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link
```

### Development Commands

| Command | Description |
|:--------|:------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode with auto-recompile |
| `npm test` | Run the test suite |
| `npm run lint` | Lint the source code |
| `npm run format` | Format code with Prettier |
| `npm run build:exe` | Build Windows executable |

### Tech Stack

<p>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/></a>
  <a href="https://github.com/tj/commander.js"><img src="https://img.shields.io/badge/Commander.js-FF5722?style=flat-square&logo=npm&logoColor=white" alt="Commander.js"/></a>
  <a href="https://developers.google.com/drive"><img src="https://img.shields.io/badge/Google%20APIs-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google APIs"/></a>
  <a href="https://github.com/chalk/chalk"><img src="https://img.shields.io/badge/Chalk-000000?style=flat-square&logo=npm&logoColor=white" alt="Chalk"/></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest"/></a>
</p>

<br/>

---

<br/>

## Contributing

Contributions are welcome and appreciated! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please read our <a href="CONTRIBUTING.md"><strong>Contributing Guide</strong></a> for detailed guidelines.

### Good First Issues

Looking for a place to start? Check out issues labeled:
- <a href="https://github.com/praaatap/Gdit/labels/good%20first%20issue"><code>good first issue</code></a>
- <a href="https://github.com/praaatap/Gdit/labels/help%20wanted"><code>help wanted</code></a>

<br/>

---

<br/>

## Changelog

See the <a href="CHANGELOG.md"><strong>CHANGELOG</strong></a> for a detailed history of changes.

### Recent Updates

**v3.0.2** - Latest
- Cleaned codebase with removed comments
- Simplified terminal output
- Fixed package.json bin configuration

**v3.0.0** - Major Release
- Complete TypeScript rewrite
- Smart sync with MD5 comparison
- New commands: `clone`, `amend`, `diff`, `whoami`, `reset`
- `.gditignore` support
- Beautiful CLI with spinners and colors

<br/>

---

<br/>

## License

This project is licensed under the **MIT License** - see the <a href="LICENSE"><strong>LICENSE</strong></a> file for details.

<br/>

---

<br/>

## Acknowledgments

Built with these amazing open-source projects:

<table>
<tr>
<td align="center"><a href="https://github.com/tj/commander.js"><strong>Commander.js</strong></a><br/>CLI framework</td>
<td align="center"><a href="https://github.com/googleapis/google-api-nodejs-client"><strong>googleapis</strong></a><br/>Google APIs client</td>
<td align="center"><a href="https://github.com/chalk/chalk"><strong>Chalk</strong></a><br/>Terminal styling</td>
<td align="center"><a href="https://github.com/sindresorhus/ora"><strong>Ora</strong></a><br/>Elegant spinners</td>
<td align="center"><a href="https://github.com/patorjk/figlet.js"><strong>Figlet</strong></a><br/>ASCII art text</td>
</tr>
</table>

<br/>

---

<br/>

<div align="center">

### Support the Project

<p>
  <a href="https://github.com/praaatap/Gdit/stargazers">
    <img src="https://img.shields.io/badge/Star%20on%20GitHub-FFD700?style=for-the-badge&logo=github&logoColor=black" alt="Star on GitHub"/>
  </a>
  <a href="https://github.com/praaatap/Gdit/issues/new?template=feature_request.md">
    <img src="https://img.shields.io/badge/Request%20Feature-4CAF50?style=for-the-badge&logo=github&logoColor=white" alt="Request Feature"/>
  </a>
  <a href="https://github.com/praaatap/Gdit/issues/new?template=bug_report.md">
    <img src="https://img.shields.io/badge/Report%20Bug-F44336?style=for-the-badge&logo=github&logoColor=white" alt="Report Bug"/>
  </a>
</p>

<br/>

<p>
  <a href="https://github.com/praaatap">
    <img src="https://img.shields.io/badge/Made%20by%20@praaatap-181717?style=flat-square&logo=github" alt="Made by praaatap"/>
  </a>
</p>

<!-- Animated Footer -->
<a href="https://github.com/praaatap/Gdit">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%" alt="footer"/>
</a>

</div>
