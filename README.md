# gdit-sync

[![NPM Version](https://img.shields.io/npm/v/gdit-sync.svg)](https://www.npmjs.com/package/gdit-sync)
[![License](https://img.shields.io/npm/l/gdit-sync.svg)](https://github.com/your-username/gdit-sync/blob/main/LICENSE)

**gdit-sync** is a command-line tool that brings a Git-like workflow to your Google Drive, allowing you to version control and sync your files from the comfort of your terminal.



---

## ⚠️ Important Security Notice

This tool requires you to use your own Google API credentials. **Under no circumstances should you ever share your `credentials.json` file or your `client_secret`**. Each user must generate their own credentials to use this tool securely.

---

## Features

* **✨ Init**: Initialize a new repository in a new Google Drive folder.
* **📦 Add & Commit**: Stage files and commit them with messages, just like Git.
* **🚀 Smart Push**: Pushes only changed files by comparing local and remote versions.
* **⬇️ Pull**: Download all files from the remote Drive folder to your local machine.
* **📊 Status**: Check the status of your staged files and unpushed commits.
* **🎨 Art**: A fun command to generate ASCII art.

---

## Installation

To install `gdit-sync` globally on your system, run the following command:

```bash
npm install -g gdit-sync
```

---

## Configuration Setup (One-Time Only)

Before you can use `gdit-sync`, you need to configure it with your own Google API credentials. This is a one-time setup.

### Step 1: Get Google OAuth 2.0 Credentials

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/apis/credentials)**.
2.  If you don't have a project, create a new one.
3.  Click **"+ CREATE CREDENTIALS"** at the top and select **"OAuth client ID"**.
4.  For the "Application type", choose **"Desktop app"** and give it a name (e.g., "gdit-sync-cli").
5.  Click **"Create"**. You will now see a **Client ID** and a **Client Secret**. Keep this window open.

### Step 2: Configure the CLI

Now, run the `setup-creds` command in your terminal. It will ask for the credentials you just generated.

```bash
gdit-sync setup-creds
```

Paste your Client ID and Client Secret when prompted. This will save them securely on your local machine.

### Step 3: Login to Your Google Account

Finally, run the `login` command. This will open your web browser and ask you to authorize the application to access your Google Drive.

```bash
gdit-sync login
```

After you approve the request, you are ready to go!

---

## Usage & Commands

Here are the main commands you will use:

| Command                            | Description                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| `gdit-sync init`                   | Initialize a new repo in the current directory.              |
| `gdit-sync add <file1> <file2>...` | Stage one or more files for the next commit.                 |
| `gdit-sync rm <file1>...`          | Remove one or more files from the stage.                     |
| `gdit-sync commit "Your message"`  | Commit the staged files with a descriptive message.          |
| `gdit-sync push`                   | Push your committed changes to your Google Drive folder.     |
| `gdit-sync pull`                   | Download files from Drive, overwriting local versions.       |
| `gdit-sync status`                 | Show the current status of your staged and committed files.  |
| `gdit-sync art "Your Text"`        | Generate cool ASCII art from your text.                      |

---

## License

This project is licensed under the MIT License.