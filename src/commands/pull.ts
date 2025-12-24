import path from 'path';
import * as config from '../core/config';
import { getAuthenticatedClient } from '../core/auth';
import { listFiles, downloadFile, getFolderInfo } from '../core/drive';
import { readJsonFile, writeJsonFile, pathExists, formatBytes, getFileHash, ensureDir } from '../utils/files';
import { printSuccess, printError, printInfo, createSpinner, chalk } from '../utils/ui';
import { promptConfirm, promptSelect } from '../utils/prompts';
import type { PullOptions, RepoConfig, RemoteInfo } from '../types';

export async function handlePull(options: PullOptions = {}): Promise<void> {
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

    if (!options.force) {
        const confirmed = await promptConfirm('This may overwrite local files. Continue?');
        if (!confirmed) {
            printInfo('Pull cancelled.');
            return;
        }
    }

    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });
    const spinner = createSpinner('Fetching remote files...');
    spinner.start();

    try {
        const remoteFiles = await listFiles(repoConfig.folderId);

        if (remoteFiles.length === 0) {
            spinner.succeed('Remote repository is empty. Nothing to pull.');
            return;
        }

        spinner.succeed(`Found ${remoteFiles.length} file(s) on remote.`);
        console.log();

        let downloaded = 0;
        let skipped = 0;
        let failed = 0;
        let totalBytes = 0;

        for (let i = 0; i < remoteFiles.length; i++) {
            const file = remoteFiles[i];
            const progress = `[${i + 1}/${remoteFiles.length}]`;
            const localPath = file.name;

            spinner.start(`${progress} Checking ${chalk.cyan(file.name)}...`);

            try {
                if (pathExists(localPath)) {
                    const localHash = await getFileHash(localPath);

                    if (localHash === file.md5Checksum) {
                        spinner.succeed(`${progress} ${chalk.gray('Up to date:')} ${file.name}`);
                        skipped++;
                        continue;
                    }

                    if (options.conflictResolution === 'local') {
                        spinner.succeed(`${progress} ${chalk.yellow('Kept local:')} ${file.name}`);
                        skipped++;
                        continue;
                    } else if (options.conflictResolution !== 'remote') {
                        spinner.stop();
                        const choice = await promptSelect(
                            `File "${file.name}" differs from remote. What to do?`,
                            ['Keep local version', 'Download remote version', 'Skip this file']
                        );

                        if (!choice || choice.index === 0 || choice.index === 2) {
                            skipped++;
                            continue;
                        }
                    }
                }

                spinner.start(`${progress} Downloading ${chalk.cyan(file.name)}...`);
                await downloadFile(file.id, localPath);

                const size = parseInt(file.size || '0', 10);
                totalBytes += size;

                spinner.succeed(`${progress} ${chalk.green('Downloaded:')} ${file.name} (${formatBytes(size)})`);
                downloaded++;
            } catch (err) {
                spinner.fail(`${progress} ${chalk.red('Failed:')} ${file.name} - ${(err as Error).message}`);
                failed++;
            }
        }

        console.log(`
${chalk.bold.cyan('Pull Summary')}
${chalk.gray('━'.repeat(40))}
  ${chalk.green('+ Downloaded:')}   ${downloaded}
  ${chalk.gray('o Skipped:')}       ${skipped}
  ${chalk.red('x Failed:')}        ${failed}
  ${chalk.cyan('Total size:')}      ${formatBytes(totalBytes)}
${chalk.gray('━'.repeat(40))}
`);

        if (failed === 0) {
            printSuccess(`Pull complete! ${downloaded} file(s) synchronized.`);
        } else {
            printError(`Pull completed with ${failed} error(s).`);
        }
    } catch (error) {
        spinner.fail(chalk.red('Pull failed.'));
        printError((error as Error).message);
    }
}

export async function handleClone(folderId: string): Promise<void> {
    const oAuth2Client = await getAuthenticatedClient();
    if (!oAuth2Client) {
        printError('You must be logged in. Run "gdit login" first.');
        return;
    }

    const spinner = createSpinner('Fetching folder info...');
    spinner.start();

    try {
        const folderInfo = await getFolderInfo(folderId);
        if (!folderInfo) {
            spinner.fail('Folder not found or access denied.');
            return;
        }

        const folderName = folderInfo.name;
        spinner.succeed(`Found folder: ${chalk.cyan(folderName)}`);

        const targetDir = path.join(process.cwd(), folderName);

        if (pathExists(targetDir)) {
            printError(`Directory "${folderName}" already exists.`);
            return;
        }

        await ensureDir(targetDir);

        const localConfigDir = path.join(targetDir, '.gdit');
        await ensureDir(localConfigDir);

        const repoConfig: RepoConfig = {
            folderId,
            name: folderName,
            createdAt: new Date().toISOString(),
        };

        const remoteInfo: RemoteInfo = {
            name: folderName,
            folderId,
            url: folderInfo.webViewLink,
            clonedAt: new Date().toISOString(),
        };

        await writeJsonFile(path.join(localConfigDir, 'config.json'), repoConfig);
        await writeJsonFile(path.join(localConfigDir, 'stage.json'), []);
        await writeJsonFile(path.join(localConfigDir, 'commits.json'), []);
        await writeJsonFile(path.join(localConfigDir, 'remote.json'), remoteInfo);

        const originalCwd = process.cwd();
        process.chdir(targetDir);

        console.log(chalk.gray(`\nCloning into '${folderName}'...\n`));

        await handlePull({ force: true, conflictResolution: 'remote' });

        process.chdir(originalCwd);

        console.log(`
${chalk.bold.green('Clone complete!')}
${chalk.gray('━'.repeat(40))}
  ${chalk.cyan('cd')} ${folderName}
  ${chalk.gray('to start working with your repository')}
`);
    } catch (error) {
        spinner.fail(chalk.red('Clone failed.'));
        printError((error as Error).message);
    }
}
