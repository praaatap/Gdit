import { statSync } from 'fs';
import * as config from '../core/config';
import { getAuthenticatedClient } from '../core/auth';
import { listFiles, uploadFile } from '../core/drive';
import { readJsonFile, writeJsonFile, pathExists, getFileHash, formatBytes } from '../utils/files';
import { printSuccess, printError, printInfo, createSpinner, chalk } from '../utils/ui';
import { promptConfirm } from '../utils/prompts';
import type { Commit, RepoConfig, DriveFile } from '../types';

export async function handlePush(): Promise<void> {
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
    const commits = await readJsonFile<Commit[]>(config.getCommitsPath(), []);
    const unpushedCommits = commits.filter((c) => !c.pushed);

    if (unpushedCommits.length === 0) {
        printInfo('Everything is up to date. Nothing to push.');
        return;
    }

    const spinner = createSpinner('Preparing to push...');
    spinner.start();

    try {
        spinner.text = 'Fetching remote file list...';
        const remoteFiles = await listFiles(repoConfig.folderId);
        const remoteMap = new Map<string, DriveFile>(remoteFiles.map((f) => [f.name, f]));

        const filesToPush = new Map<string, string>();
        for (const commit of unpushedCommits) {
            for (const fileInfo of commit.files) {
                const filePath = fileInfo.path;
                if (!filesToPush.has(filePath)) {
                    filesToPush.set(filePath, filePath);
                }
            }
        }

        spinner.succeed(`Found ${unpushedCommits.length} unpushed commit(s) with ${filesToPush.size} unique file(s).`);
        console.log();

        let uploaded = 0;
        let updated = 0;
        let skipped = 0;
        let failed = 0;
        let totalBytes = 0;

        const fileArray = Array.from(filesToPush.values());

        for (let i = 0; i < fileArray.length; i++) {
            const filePath = fileArray[i];
            const progress = `[${i + 1}/${fileArray.length}]`;

            spinner.start(`${progress} Processing ${chalk.cyan(filePath)}...`);

            if (!pathExists(filePath)) {
                spinner.warn(`${progress} Skipped (file deleted): ${filePath}`);
                skipped++;
                continue;
            }

            try {
                const localHash = await getFileHash(filePath);
                const remoteFile = remoteMap.get(filePath);

                if (remoteFile && remoteFile.md5Checksum === localHash) {
                    spinner.succeed(`${progress} ${chalk.gray('Already up to date:')} ${filePath}`);
                    skipped++;
                    continue;
                }

                const result = await uploadFile(filePath, repoConfig.folderId, remoteFile?.id);

                if (!result) {
                    throw new Error('Upload returned null');
                }

                const stats = statSync(filePath);
                totalBytes += stats.size;

                if (result.action === 'updated') {
                    spinner.succeed(`${progress} ${chalk.yellow('Updated:')} ${filePath}`);
                    updated++;
                } else {
                    spinner.succeed(`${progress} ${chalk.green('Created:')} ${filePath}`);
                    uploaded++;
                }
            } catch (err) {
                spinner.fail(`${progress} ${chalk.red('Failed:')} ${filePath} - ${(err as Error).message}`);
                failed++;
            }
        }

        const updatedCommits = commits.map((c) =>
            c.pushed ? c : { ...c, pushed: true, pushedAt: new Date().toISOString() }
        );
        await writeJsonFile(config.getCommitsPath(), updatedCommits);

        console.log(`
${chalk.bold.cyan('Push Summary')}
${chalk.gray('━'.repeat(40))}
  ${chalk.green('+ New files:')}     ${uploaded}
  ${chalk.yellow('~ Updated:')}       ${updated}
  ${chalk.gray('o Skipped:')}       ${skipped}
  ${chalk.red('x Failed:')}        ${failed}
  ${chalk.cyan('Total size:')}      ${formatBytes(totalBytes)}
${chalk.gray('━'.repeat(40))}
`);

        if (failed === 0) {
            printSuccess(`Push complete! ${uploaded + updated} file(s) synced to Google Drive.`);
        } else {
            printError(`Push completed with ${failed} error(s).`);
        }
    } catch (error) {
        spinner.fail(chalk.red('Push failed.'));
        printError((error as Error).message);
    }
}

export async function handleForcePush(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const confirmed = await promptConfirm('Force push will upload ALL committed files. Continue?');

    if (!confirmed) {
        printInfo('Force push cancelled.');
        return;
    }

    const commits = await readJsonFile<Commit[]>(config.getCommitsPath(), []);
    const resetCommits = commits.map((c) => ({ ...c, pushed: false }));
    await writeJsonFile(config.getCommitsPath(), resetCommits);

    await handlePush();
}
