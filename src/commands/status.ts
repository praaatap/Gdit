import * as config from '../core/config';
import { getAuthenticatedClient } from '../core/auth';
import { listFiles } from '../core/drive';
import { readJsonFile, pathExists, getFileInfo, getFileHash, formatBytes } from '../utils/files';
import { printError, chalk } from '../utils/ui';
import type { Commit, RepoConfig, RemoteInfo, LogOptions } from '../types';

export async function handleStatus(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const stage = await readJsonFile<string[]>(config.getStagePath(), []);
    const commits = await readJsonFile<Commit[]>(config.getCommitsPath(), []);
    const remote = await readJsonFile<RemoteInfo>(config.getRemotePath(), { name: '', folderId: '' });

    const unpushedCount = commits.filter((c) => !c.pushed).length;
    const totalCommits = commits.length;

    console.log(`
${chalk.bold.magenta('┌─────────────────────────────────────────────┐')}
${chalk.bold.magenta('│')}  ${chalk.bold.white('gdit status')}                                ${chalk.bold.magenta('│')}
${chalk.bold.magenta('└─────────────────────────────────────────────┘')}
`);

    console.log(chalk.bold.cyan('On branch ') + chalk.yellow('main'));

    if (remote.name) {
        const remoteUrl = remote.url ? chalk.cyan.underline(remote.url) : 'Google Drive';
        console.log(chalk.gray(`Remote: ${remote.name} > ${remoteUrl}`));
    }
    console.log();

    if (unpushedCount > 0) {
        console.log(chalk.yellow(`Your branch is ahead of 'origin/main' by ${unpushedCount} commit(s).`));
        console.log(chalk.gray(`   Use "gdit push" to publish your local commits.\n`));
    } else if (totalCommits > 0) {
        console.log(chalk.green('Your branch is up to date with origin/main.\n'));
    } else {
        console.log(chalk.gray('No commits yet.\n'));
    }

    console.log(chalk.bold.cyan('Changes to be committed:'));
    console.log(chalk.gray('  (use "gdit rm <file>..." to unstage)'));
    console.log();

    if (stage.length > 0) {
        for (const file of stage) {
            const info = await getFileInfo(file);
            const sizeStr = info.exists ? chalk.gray(` (${info.sizeFormatted})`) : chalk.red(' (deleted)');
            console.log(chalk.green(`        new file:   ${file}${sizeStr}`));
        }
    } else {
        console.log(chalk.gray('        (no changes staged for commit)'));
    }

    console.log();

    if (commits.length > 0) {
        console.log(chalk.bold.cyan('Recent commits:'));
        const recentCommits = commits.slice(-3).reverse();

        for (const commit of recentCommits) {
            const statusIcon = commit.pushed ? chalk.green('+') : chalk.yellow('o');
            const date = new Date(commit.timestamp).toLocaleDateString();
            console.log(`  ${statusIcon} ${chalk.yellow(commit.id)} - ${commit.message} ${chalk.gray(`(${date})`)}`);
        }

        if (commits.length > 3) {
            console.log(chalk.gray(`  ... and ${commits.length - 3} more commits`));
        }
    }

    console.log();
}

export async function handleLog(options: LogOptions = {}): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const commits = await readJsonFile<Commit[]>(config.getCommitsPath(), []);

    if (commits.length === 0) {
        console.log(chalk.gray('\nNo commits yet.\n'));
        return;
    }

    const limit = options.limit || commits.length;
    const displayCommits = commits.slice(-limit).reverse();

    console.log();

    for (const commit of displayCommits) {
        const statusBadge = commit.pushed
            ? chalk.bgGreen.black(' PUSHED ')
            : chalk.bgYellow.black(' LOCAL ');

        console.log(chalk.yellow(`commit ${commit.id}`) + `  ${statusBadge}`);
        console.log(chalk.gray(`Date:   ${new Date(commit.timestamp).toLocaleString()}`));
        console.log();
        console.log(`    ${commit.message}`);
        console.log();

        if (options.showFiles && commit.files) {
            console.log(chalk.gray('    Files:'));
            for (const file of commit.files) {
                const filePath = file.path;
                console.log(chalk.green(`        ${filePath}`));
            }
            console.log();
        }

        console.log(chalk.gray('─'.repeat(50)));
        console.log();
    }
}

export async function handleDiff(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const oAuth2Client = await getAuthenticatedClient();
    if (!oAuth2Client) {
        printError('You must be logged in. Run "gdit login" first.');
        return;
    }

    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });

    console.log(chalk.gray('\nComparing local files with remote...\n'));

    try {
        const remoteFiles = await listFiles(repoConfig.folderId);
        const remoteMap = new Map(remoteFiles.map((f) => [f.name, f]));

        const stage = await readJsonFile<string[]>(config.getStagePath(), []);
        const commits = await readJsonFile<Commit[]>(config.getCommitsPath(), []);

        const trackedFiles = new Set<string>([
            ...stage,
            ...commits.flatMap((c) => c.files.map((f) => f.path)),
        ]);

        let modified = 0;
        let added = 0;
        let deleted = 0;

        for (const filePath of trackedFiles) {
            const remoteFile = remoteMap.get(filePath);

            if (!pathExists(filePath)) {
                if (remoteFile) {
                    console.log(chalk.red(`  D ${filePath}`));
                    deleted++;
                }
                continue;
            }

            const localHash = await getFileHash(filePath);

            if (!remoteFile) {
                console.log(chalk.green(`  A ${filePath}`));
                added++;
            } else if (localHash !== remoteFile.md5Checksum) {
                console.log(chalk.yellow(`  M ${filePath}`));
                modified++;
            }

            remoteMap.delete(filePath);
        }

        for (const [name] of remoteMap) {
            console.log(chalk.cyan(`  R ${name} (remote only)`));
        }

        console.log();
        console.log(chalk.gray('─'.repeat(40)));
        console.log(`${chalk.green(`${added} added`)}, ${chalk.yellow(`${modified} modified`)}, ${chalk.red(`${deleted} deleted`)}`);
        console.log();
    } catch (error) {
        printError(`Failed to compare: ${(error as Error).message}`);
    }
}
