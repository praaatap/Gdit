#!/usr/-bin/env node

const { program } = require("commander");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs").promises;
const { createReadStream, createWriteStream, existsSync } = require("fs");
const http = require("http");
const os = require("os");
const readline = require("readline");
const crypto = require("crypto");
const figlet = require("figlet"); // Import figlet

// --- DYNAMICALLY IMPORT ESM PACKAGES ---
let chalk, boxen, ora, open;
async function loadESM() {
  chalk = (await import("chalk")).default;
  boxen = (await import("boxen")).default;
  ora = (await import("ora")).default;
  open = (await import("open")).default;
}

// --- CONFIGURATION ---
const HOME_DIR = os.homedir();
const GLOBAL_CONFIG_DIR = path.join(HOME_DIR, ".gdit-sync");
const GLOBAL_TOKEN_PATH = path.join(GLOBAL_CONFIG_DIR, "token.json");
const GLOBAL_CREDENTIALS_PATH = path.join(
  GLOBAL_CONFIG_DIR,
  "credentials.json"
);

const CONFIG_DIR = path.join(process.cwd(), ".gdit");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const STAGE_PATH = path.join(CONFIG_DIR, "stage.json");
const COMMITS_PATH = path.join(CONFIG_DIR, "commits.json");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const PORT = 5000;
const REDIRECT_URI = `http://localhost:${PORT}`;

// --- UI HELPER FUNCTIONS ---
const printSuccess = (msg) =>
  console.log(
    boxen(chalk.green.bold(`✅ ${msg}`), {
      padding: 1,
      borderColor: "green",
      margin: 1,
    })
  );
const printError = (msg) =>
  console.log(
    boxen(chalk.red.bold(`❌ ${msg}`), {
      padding: 1,
      borderColor: "red",
      margin: 1,
    })
  );
const printInfo = (msg) =>
  console.log(
    boxen(chalk.cyan.bold(`ℹ️ ${msg}`), {
      padding: 1,
      borderColor: "cyan",
      margin: 1,
    })
  );
const printWarning = (msg) =>
  console.log(
    boxen(chalk.yellow.bold(`⚠️ ${msg}`), {
      padding: 1,
      borderColor: "yellow",
      margin: 1,
    })
  );

  const takingPromptInput = (query) => {
    const r1= readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    return new Promise((resolve)=> r1.question(
        chalk.magenta(`\n> ${query}`),(ans)=>{
            r1.close();
            resolve(ans);
        }
    ))
  }
const promptInput = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(chalk.magenta(`\n> ${query}`), (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

// --- CORE HELPER FUNCTIONS ---
const getFileHash = async (filePath) => {
  const content = await fs.readFile(filePath);
  return crypto.createHash("md5").update(content).digest("hex");
};

const readJsonfiles = async (filePath, defaultValue) => {
  try {
    const content = await fs.readFile(filePath);
    return JSON.parse(content);
  } catch (err) {
    return defaultValue;
  }
};

const readJsonFile = async (filePath, defaultValue) => {
  try {
    const content = await fs.readFile(filePath);
    return JSON.parse(content);
  } catch (err) {
    return defaultValue;
  }
};

const ensureGlobalDir = async () =>
  await fs.mkdir(GLOBAL_CONFIG_DIR, { recursive: true });

// --- AUTHENTICATION ---
async function handleSetupCreds() {
  printInfo("First, get your Google OAuth 2.0 Credentials.");
  console.log(
    `${chalk.green("1.")} Go to: ${chalk.cyan.underline(
      "https://console.cloud.google.com/apis/credentials"
    )}\n` +
      `${chalk.green("2.")} Click ${chalk.bold(
        "+ CREATE CREDENTIALS"
      )} and choose ${chalk.bold("OAuth client ID")}.\n` +
      `${chalk.green("3.")} Set Application type to ${chalk.bold(
        "Desktop app"
      )}.\n` +
      `${chalk.green("4.")} Copy the Client ID and Client Secret below.`
  );

  const clientId = await promptInput("Enter your Client ID: ");
  const clientSecret = await promptInput("Enter your Client Secret: ");

  if (!clientId || !clientSecret) {
    printError("Client ID and Client Secret are required.");
    return;
  }

  const credentials = {
    installed: {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [REDIRECT_URI],
    },
  };
  await ensureGlobalDir();
  await fs.writeFile(
    GLOBAL_CREDENTIALS_PATH,
    JSON.stringify(credentials, null, 2)
  );
  printSuccess(
    `Credentials saved globally to: ${chalk.yellow(GLOBAL_CREDENTIALS_PATH)}`
  );
}

async function getAuthenticatedClient() {
  let credentials;
  try {
    credentials = JSON.parse(await fs.readFile(GLOBAL_CREDENTIALS_PATH));
  } catch (err) {
    printError(
      'Credentials not found. Please run "gdit-sync setup-creds" first.'
    );
    return null;
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = await fs.readFile(GLOBAL_TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return null;
  }
  return oAuth2Client;
}

async function handleLogin() {
  let credentials;
  try {
    credentials = JSON.parse(await fs.readFile(GLOBAL_CREDENTIALS_PATH));
  } catch (err) {
    return printError(
      'Credentials not found. Please run "gdit-sync setup-creds" first.'
    );
  }

  const { client_secret, client_id } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  printInfo("Opening your browser for authentication...");
  console.log(
    `If it doesn't open, please visit:\n${chalk.cyan.underline(authUrl)}`
  );
  await open(authUrl);

  const server = http
    .createServer(async (req, res) => {
      if (req.url.includes("/?code=")) {
        const code = new URL(req.url, REDIRECT_URI).searchParams.get("code");
        res.end(
          "<h1>Authentication successful!</h1><p>You can close this window now.</p>"
        );
        server.close();
        const { tokens } = await oAuth2Client.getToken(code);
        await ensureGlobalDir();
        await fs.writeFile(GLOBAL_TOKEN_PATH, JSON.stringify(tokens));
        printSuccess("Successfully logged in! Token stored securely.");
      }
    })
    .listen(PORT);
}

// --- GIT-LIKE COMMANDS ---

async function handleInit() {
  if (existsSync(CONFIG_DIR))
    return printWarning("This directory is already initialized.");

  const oAuth2Client = await getAuthenticatedClient();
  if (!oAuth2Client)
    return printError(
      'You must be logged in to initialize a repository. Run "gdit-sync login".'
    );

  const drive = google.drive({ version: "v3", auth: oAuth2Client });
  const folderName = path.basename(process.cwd());
  const spinner = ora(
    chalk.blue(`Creating Google Drive folder: "${folderName}"`)
  ).start();

  try {
    const { data } = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });

    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify({ folderId: data.id }));
    await fs.writeFile(STAGE_PATH, JSON.stringify([]));
    await fs.writeFile(COMMITS_PATH, JSON.stringify([]));

    spinner.succeed(
      chalk.green(
        `Repository initialized! Drive Folder ID: ${chalk.cyan(data.id)}`
      )
    );
  } catch (error) {
    spinner.fail(chalk.red("Failed to initialize repository."));
    printError(error.message);
  }
}

async function handleAdd(files) {
  if (!existsSync(CONFIG_DIR))
    return printError('Not a gdit-sync repository. Run "gdit-sync init".');
  const stage = await readJsonFile(STAGE_PATH, []);
  let addedCount = 0;
  for (const file of files) {
    if (!existsSync(file)) {
      printWarning(`File not found: ${file}`);
      continue;
    }
    if (!stage.includes(file)) {
      stage.push(file);
      addedCount++;
    }
  }
  await fs.writeFile(STAGE_PATH, JSON.stringify(stage, null, 2));
  if (addedCount > 0) printSuccess(`Staged ${addedCount} new file(s).`);
  else printInfo("No new files to stage.");
}

async function handleRm(files) {
  if (!existsSync(CONFIG_DIR)) return printError("Not a gdit-sync repository.");
  let stage = await readJsonFile(STAGE_PATH, []);
  let removedCount = 0;

  stage = stage.filter((stagedFile) => {
    const shouldRemove = files.includes(stagedFile);
    if (shouldRemove) removedCount++;
    return !shouldRemove;
  });

  if (removedCount > 0) {
    await fs.writeFile(STAGE_PATH, JSON.stringify(stage, null, 2));
    printSuccess(`Removed ${removedCount} file(s) from the stage.`);
  } else {
    printInfo("No matching files found in the stage.");
  }
}

async function handleCommit(message) {
  if (!existsSync(CONFIG_DIR)) return printError("Not a gdit-sync repository.");
  const stage = await readJsonFile(STAGE_PATH, []);
  if (stage.length === 0)
    return printWarning(
      'Nothing to commit. Stage files with "gdit-sync add <files...>".'
    );

  const commits = await readJsonFile(COMMITS_PATH, []);
  const commit = {
    id: crypto.randomBytes(8).toString("hex"),
    message,
    files: stage,
    timestamp: new Date().toISOString(),
    pushed: false,
  };
  commits.push(commit);

  await fs.writeFile(COMMITS_PATH, JSON.stringify(commits, null, 2));
  await fs.writeFile(STAGE_PATH, "[]");

  printSuccess(`Committed ${stage.length} file(s): [${commit.id}] ${message}`);
}

async function handlePush() {
  if (!existsSync(CONFIG_DIR)) return printError("Not a gdit-sync repository.");
  const oAuth2Client = await getAuthenticatedClient();
  if (!oAuth2Client)
    return printError('You must be logged in to push. Run "gdit-sync login".');

  const drive = google.drive({ version: "v3", auth: oAuth2Client });
  const config = await readJsonFile(CONFIG_PATH);
  const commits = await readJsonFile(COMMITS_PATH, []);
  const unpushedCommits = commits.filter((c) => !c.pushed);

  if (unpushedCommits.length === 0)
    return printInfo("Everything is up to date.");

  const spinner = ora(chalk.blue("Preparing to push...")).start();
  try {
    spinner.text = "Fetching remote file list...";
    const { data } = await drive.files.list({
      q: `'${config.folderId}' in parents and trashed=false`,
      fields: "files(id, name, md5Checksum)",
    });
    const remoteFiles = new Map(data.files.map((f) => [f.name, f]));

    const filesToPush = [...new Set(unpushedCommits.flatMap((c) => c.files))];
    spinner.info(
      `Found ${unpushedCommits.length} unpushed commits containing ${filesToPush.length} unique files.`
    );

    for (let i = 0; i < filesToPush.length; i++) {
      const file = filesToPush[i];
      spinner.start(`[${i + 1}/${filesToPush.length}] Processing ${file}...`);

      if (!existsSync(file)) {
        spinner.warn(`Skipping deleted file: ${file}`);
        continue;
      }

      const localHash = await getFileHash(file);
      const remoteFile = remoteFiles.get(file);

      if (remoteFile && remoteFile.md5Checksum === localHash) {
        spinner.succeed(
          `[${i + 1}/${filesToPush.length}] ${file} is already up to date.`
        );
        continue;
      }

      const media = { body: createReadStream(file) };
      if (remoteFile) {
        spinner.text = `[${i + 1}/${filesToPush.length}] Updating ${file}...`;
        await drive.files.update({ fileId: remoteFile.id, media });
        spinner.succeed(`[${i + 1}/${filesToPush.length}] Updated ${file}.`);
      } else {
        spinner.text = `[${i + 1}/${filesToPush.length}] Creating ${file}...`;
        const resource = { name: file, parents: [config.folderId] };
        await drive.files.create({ resource, media, fields: "id" });
        spinner.succeed(`[${i + 1}/${filesToPush.length}] Created ${file}.`);
      }
    }

    const updatedCommits = commits.map((c) =>
      c.pushed ? c : { ...c, pushed: true }
    );
    await fs.writeFile(COMMITS_PATH, JSON.stringify(updatedCommits, null, 2));

    printSuccess("Push complete!");
  } catch (error) {
    spinner.fail(chalk.red("Push failed."));
    printError(error.message);
  }
}

async function handlePull() {
  if (!existsSync(CONFIG_DIR)) return printError("Not a gdit-sync repository.");
  const oAuth2Client = await getAuthenticatedClient();
  if (!oAuth2Client)
    return printError('You must be logged in to pull. Run "gdit-sync login".');

  const confirm = await promptInput(
    "This will overwrite local files. Are you sure? (y/N): "
  );
  if (confirm.toLowerCase() !== "y") return printInfo("Pull cancelled.");

  const drive = google.drive({ version: "v3", auth: oAuth2Client });
  const config = await readJsonFile(CONFIG_PATH);
  const spinner = ora(chalk.blue("Fetching remote file list...")).start();

  try {
    const { data } = await drive.files.list({
      q: `'${config.folderId}' in parents and trashed=false`,
      fields: "files(id, name)",
    });

    if (data.files.length === 0)
      return spinner.succeed("Remote repository is empty.");

    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i];
      spinner.text = `[${i + 1}/${data.files.length}] Downloading ${
        file.name
      }...`;

      const dest = createWriteStream(file.name);
      const res = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "stream" }
      );
      await new Promise((resolve, reject) => {
        res.data.pipe(dest);
        res.data.on("end", resolve);
        res.data.on("error", reject);
      });
    }
    spinner.succeed(
      chalk.green(`Successfully pulled ${data.files.length} file(s).`)
    );
  } catch (error) {
    spinner.fail(chalk.red("Pull failed."));
    printError(error.message);
  }
}

async function handleStatus() {
  if (!existsSync(CONFIG_DIR)) return printError("Not a gdit-sync repository.");

  const stage = await readJsonFile(STAGE_PATH, []);
  const commits = await readJsonFile(COMMITS_PATH, []);
  const unpushedCount = commits.filter((c) => !c.pushed).length;

  console.log(`\nOn branch main (metaphorically)`);
  if (unpushedCount > 0) {
    console.log(
      chalk.yellow(
        `Your branch is ahead of 'origin/main' by ${unpushedCount} commit(s).`
      )
    );
    console.log(`  (use "gdit-sync push" to publish your local commits)`);
  } else {
    console.log(chalk.green(`Your branch is up to date.`));
  }

  console.log(chalk.bold.cyan("\nChanges to be committed:"));
  if (stage.length > 0) {
    stage.forEach((file) => console.log(chalk.green(`\tnew file:   ${file}`)));
  } else {
    console.log(chalk.gray("\t(no changes staged for commit)"));
  }
}

// --- ASCII ART COMMAND ---
async function handleArt(text) {
  try {
    const artText = await new Promise((resolve, reject) => {
      figlet(
        text,
        { font: "Standard", horizontalLayout: "default" },
        (err, data) => {
          if (err) {
            return reject("Something went wrong with figlet...");
          }
          resolve(data);
        }
      );
    });
    console.log(chalk.cyanBright.bold(artText));
  } catch (error) {
    printError(error);
  }
}

// --- MAIN EXECUTION ---
async function main() {
  await loadESM();

  program
    .name("gdit-sync")
    .version("2.1.0") // Updated version
    .description(
      chalk.magenta.bold("A Git-like CLI for syncing files with Google Drive.")
    );

  program
    .command("setup-creds")
    .description("🔧 Configure your Google API credentials")
    .action(handleSetupCreds);
  program
    .command("login")
    .description("🔑 Authenticate with your Google account")
    .action(handleLogin);
  program
    .command("init")
    .description("✨ Initialize a new repository in the current directory")
    .action(handleInit);
  program
    .command("add <files...>")
    .description("📦 Stage one or more files for the next commit")
    .action(handleAdd);
  program
    .command("rm <files...>")
    .description("➖ Remove files from the stage")
    .action(handleRm);
  program
    .command("commit <message>")
    .description("📝 Commit staged files with a message")
    .action(handleCommit);
  program
    .command("push")
    .description("🚀 Push committed changes to Google Drive")
    .action(handlePush);
  program
    .command("pull")
    .description("⬇️ Pull remote files, overwriting local versions")
    .action(handlePull);
  program
    .command("status")
    .description("📊 Show the working tree status")
    .action(handleStatus);
  program
    .command("art <text>")
    .description("🎨 Generate ASCII art from text")
    .action(handleArt);

  program.parse(process.argv);
}

main().catch((err) => {
  console.error(chalk.red.bold("\nAn unexpected error occurred:"), err);
});
