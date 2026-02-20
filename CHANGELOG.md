# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-02-20

### Added
- **Google Cloud Storage (GCS)** support: `gdit gcp` commands (list, upload, download, delete, sync)
- **Azure Blob Storage** support: `gdit azure` commands (list, upload, download, delete, sync)
- **AWS S3** support: Enhanced `gdit s3` commands with interactive credential setup
- Multi-cloud command subgroup architecture using Commander.js namespaces
- Interactive credential prompting for cloud storage providers
- Automatic saving of cloud bucket/container settings to repository config

### Changed
- Refactored CLI command registration to prevent command name collisions
- Improved module export structure in `src/core` and `src/commands` for better extensibility
- Updated dependencies to include latest cloud SDKs (@google-cloud/storage, @azure/storage-blob)

### Fixed
- Fixed CLI issue where subcommands were being registered globally instead of under their parent commands
- Corrected various TypeScript export ambiguities in the core library


## [3.0.1] - 2024-12-24

### Changed
- Removed all code comments for cleaner codebase
- Removed emojis from CLI command descriptions
- Simplified terminal output messages
- Cleaned up workflow files

### Fixed
- Fixed package.json bin path configuration
- Improved error handling messages

## [3.0.0] - 2024-12-24

### Added
- Complete TypeScript rewrite with full type safety
- New `clone` command to clone existing Drive folders
- New `amend` command to modify last commit message
- New `diff` command to compare local vs remote files
- New `whoami` command to show user info and storage quota
- New `reset` command to clear staging area
- `.gditignore` file support for ignoring files
- Smart sync - only uploads files that have changed (MD5 comparison)
- Beautiful CLI output with spinners, boxes, and colors
- Conflict resolution options for pull (`--theirs`, `--ours`)
- Force push option (`-f, --force`)
- Commit history with push status badges
- Storage quota display in `whoami`
- Remote URL quick open (`gdit remote open`)
- GitHub Actions CI/CD workflows
- Issue and PR templates

### Changed
- Migrated from JavaScript to TypeScript
- Improved project structure with modular architecture
- Enhanced error handling with better messages
- Updated all dependencies to latest versions

### Fixed
- Token refresh handling for expired OAuth tokens
- File path normalization across operating systems
- Better handling of deleted files during push

## [2.0.0] - 2024-12-01

### Added
- Initial public release
- Basic Git-like workflow (init, add, commit, push, pull)
- Google Drive integration via OAuth 2.0
- Colorful CLI output
