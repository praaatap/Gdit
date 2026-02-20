# gdit

Git-like version control for Google Drive.

Simple CLI to stage, commit and sync files between a local project and Google Drive.

## Install

Install globally from npm:

```bash
npm install -g gdit
```

Requires Node.js >= 18.

## Quick start

1. Configure Google credentials:

```bash
gdit setup-creds
```

2. Authenticate:

```bash
gdit login
```

3. Initialize, add, commit and push:

```bash
gdit init
gdit add .
gdit commit -m "Initial commit"
gdit push
```

## S3 support

`gdit` includes optional S3 commands to upload/download and sync repository files.

- Credentials: preferred via environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) or entered interactively when needed.
- Bucket: uses `s3Bucket` from `.gdit/config.json` if present; otherwise `--bucket` or interactive prompt.

Examples:

```bash
gdit s3 upload path/to/file.txt --bucket my-bucket
gdit s3 list --bucket my-bucket --prefix path/to/
gdit s3 download path/to/object.txt --bucket my-bucket --out ./downloads
gdit s3 sync --direction push --bucket my-bucket
```

## Commands (common)

- `gdit setup-creds` — configure Google OAuth client ID/secret
- `gdit login` — authenticate with Google
- `gdit init` — initialize repository
- `gdit add <files...>` — stage files
- `gdit commit -m "msg"` — commit staged files
- `gdit push` / `gdit pull` — sync with Google Drive
- `gdit s3 ...` — S3: `list`, `upload`, `download`, `delete`, `sync`
- `gdit status`, `gdit log`, `gdit diff` — inspect repository

For full command list run `gdit --help`.

## Configuration

Repository settings are stored in `.gdit/config.json`. You can add a default S3 bucket there using the key `s3Bucket`.

Global credentials and tokens are stored under `~/.gdit/` (`credentials.json`, `token.json`).

## Contributing

Contributions are welcome. Steps:

```bash
git clone https://github.com/YOUR_USERNAME/Gdit.git
cd Gdit
npm install
npm run build
```

Open a pull request with tests and a clear description.

## License

MIT. See the `LICENSE` file for details.


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
git clone https://github.com/YOUR_USERNAME/Gdit.git
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
- <a href="https://github.com/YOUR_USERNAME/Gdit/labels/good%20first%20issue"><code>good first issue</code></a>
- <a href="https://github.com/YOUR_USERNAME/Gdit/labels/help%20wanted"><code>help wanted</code></a>

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
  <a href="https://github.com/YOUR_USERNAME/Gdit/stargazers">
    <img src="https://img.shields.io/badge/Star%20on%20GitHub-FFD700?style=for-the-badge&logo=github&logoColor=black" alt="Star on GitHub"/>
  </a>
  <a href="https://github.com/YOUR_USERNAME/Gdit/issues/new?template=feature_request.md">
    <img src="https://img.shields.io/badge/Request%20Feature-4CAF50?style=for-the-badge&logo=github&logoColor=white" alt="Request Feature"/>
  </a>
  <a href="https://github.com/YOUR_USERNAME/Gdit/issues/new?template=bug_report.md">
    <img src="https://img.shields.io/badge/Report%20Bug-F44336?style=for-the-badge&logo=github&logoColor=white" alt="Report Bug"/>
  </a>
</p>

<br/>

<p>
  <a href="https://github.com/YOUR_USERNAME">
    <img src="https://img.shields.io/badge/Made%20by%20Open%20Source-181717?style=flat-square&logo=github" alt="Made by Open Source"/>
  </a>
</p>

<!-- Animated Footer -->
<a href="https://github.com/YOUR_USERNAME/Gdit">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%" alt="footer"/>
</a>

</div>
