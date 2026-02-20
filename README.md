# gdit

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=gdit&fontSize=90&animation=fadeIn&fontAlignY=40" width="100%" alt="gdit header"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/gdit"><img src="https://img.shields.io/npm/v/gdit.svg?style=flat-square" alt="NPM Version"/></a>
  <a href="https://www.npmjs.com/package/gdit"><img src="https://img.shields.io/npm/dm/gdit.svg?style=flat-square" alt="NPM Downloads"/></a>
  <a href="https://github.com/YOUR_USERNAME/Gdit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/gdit.svg?style=flat-square" alt="License"/></a>
  <a href="https://github.com/YOUR_USERNAME/Gdit/stargazers"><img src="https://img.shields.io/github/stars/YOUR_USERNAME/Gdit.svg?style=flat-square&logo=github" alt="GitHub stars"/></a>
</p>

---

**gdit** (Google Drive Git) is a powerful, lightweight CLI tool that brings a Git-like workflow to Google Drive. It allows you to stage, commit, and sync your local files with Google Drive folders while providing additional support for major cloud storage providers like AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage.

## 🚀 Key Features

- **Git-like Workflow**: Use familiar commands like `init`, `add`, `commit`, `push`, and `pull`.
- **Google Drive Sync**: Seamlessly version your local project against a Google Drive folder.
- **Multi-Cloud Support**: Integrated commands for **AWS S3**, **Google Cloud Storage (GCS)**, and **Azure Blob Storage**.
- **Smart Syncing**: Only uploads/downloads changed files using MD5 hash comparison.
- **Interactive Setup**: Simple, prompt-based configuration for OAuth and cloud credentials.
- **Developer Friendly**: Written in TypeScript with full type safety and beautiful terminal output using `ora` spinners and `chalk`.

## 📦 Installation

Install globally via npm:

```bash
npm install -g gdit
```

*Requires Node.js version 18 or higher.*

## 🛠️ Quick Start

### 1. Setup Google Credentials
Configure your own OAuth Client ID and Secret to ensure full privacy.
```bash
gdit setup-creds
gdit login
```

### 2. Initialize a Repository
Initialize the current directory and link it to a Google Drive folder.
```bash
gdit init
```

### 3. Basic Workflow
```bash
gdit add .                          # Stage files
gdit commit -m "My first commit"    # Commit locally
gdit push                           # Sync to Google Drive
```

---

## ☁️ Multi-Cloud Commands

`gdit` provides dedicated subgroups for interacting with other cloud storage providers.

### Google Cloud Storage (GCS)
```bash
gdit gcp list --bucket my-bucket
gdit gcp sync --direction push --bucket my-bucket
```

### AWS S3
```bash
gdit s3 list --bucket my-bucket
gdit s3 sync --direction push --bucket my-bucket
```

### Azure Blob Storage
```bash
gdit azure list --container my-container
gdit azure sync --direction push --container my-container
```

---

## 📜 Commands Reference

| Command | Description |
|:---|:---|
| `init` | Initialize a new gdit repository |
| `clone <id>` | Clone an existing Drive folder |
| `add <files>` | Stage files for commit |
| `commit -m <msg>` | Commit staged files locally |
| `push` | Upload commits to Google Drive |
| `pull` | Download files from Google Drive |
| `status` | Show staging and sync status |
| `log` | Show commit history |
| `diff` | Compare local files with remote |
| `whoami` | Show current user and storage quota |
| `s3 <cmd>` | AWS S3 operations (list/upload/download/sync) |
| `gcp <cmd>` | GCS operations (list/upload/download/sync) |
| `azure <cmd>` | Azure operations (list/upload/download/sync) |

Run `gdit --help` for the full list of options and subcommands.

---

## 📁 Project Architecture

```text
src/
├── commands/     # CLI command handlers (S3, GCP, Azure, Git-flow)
├── core/         # Core logic (Auth, Cloud SDK wrappers, Drive API)
├── utils/        # UI helpers, File system operations, Prompts
├── types/        # TypeScript interfaces and shared types
└── index.ts      # Command-line entry point
```

---

## 🛡️ Security

- **Self-Hosted Credentials**: `gdit` uses your own Google Cloud projects, so your data never touches third-party servers.
- **Minimal Scopes**: Only requests `drive.file` access to interact with files it creates.
- **Local Storage**: All tokens and keys are stored securely in `~/.gdit/` on your machine.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) to get started with local development.

```bash
git clone https://github.com/YOUR_USERNAME/Gdit.git
npm install
npm run build
npm link
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

<p align="center">
  <a href="https://github.com/YOUR_USERNAME/Gdit">
    <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%" alt="footer"/>
  </a>
</p>
