# Contributing to gdit

First off, thank you for considering contributing to gdit! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 7.0.0 or higher
- A Google Cloud account (for Drive/GCS testing)
- An AWS account (for S3 testing)
- An Azure account (for Blob Storage testing)

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/gdit.git
   cd gdit
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Link the package locally**

   ```bash
   npm link
   ```

4. **Set up Google credentials** (for testing)

   ```bash
   gdit setup-creds
   gdit login
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When filing a bug report, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (Node.js version, OS, etc.)
- Any relevant error messages or logs

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been suggested
- Provide a clear use case
- Describe how you envision the feature working

### Contributing Code

1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to let others know you're working on it
3. Follow the [Pull Request Process](#pull-request-process)

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our [Coding Guidelines](#coding-guidelines)
   - Add tests if applicable
   - Update documentation if needed

3. **Test your changes**

   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   - Follow our [Commit Message Guidelines](#commit-messages)

5. **Push and create a PR**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **In your PR description**
   - Reference any related issues
   - Describe what changes you made
   - Include screenshots for UI changes

## Coding Guidelines

### Code Style

- Use ES6+ features where appropriate
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused

### File Organization

```
src/
├── commands/     # CLI command handlers
├── core/         # Core functionality (auth, drive, config)
├── utils/        # Utility functions (UI, files, prompts)
└── index.js      # Main entry point
```

### Example Code Style

```javascript
/**
 * Upload a file to Google Drive
 * @param {string} localPath - Path to the local file
 * @param {string} folderId - Target folder ID in Drive
 * @returns {Promise<Object>} Upload result with file ID
 */
async function uploadFile(localPath, folderId) {
  // Implementation
}
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(push): add force push option

fix(auth): handle token refresh on expiry

docs: update installation instructions
```

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing!

---

Thank you for contributing to gdit! 🙌
