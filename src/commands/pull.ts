import path from 'path';
import * as config from '../core/config';
import { getAuthenticatedClient } from '../core/auth';
import { listFiles, downloadFile, getFolderInfo } from '../core/drive';
import { readJsonFile, writeJsonFile, pathExists, formatBytes, getFileHash, ensureDir } from '../utils/files';
import { printSuccess, printError, printInfo, createSpinner, chalk } from '../utils/ui';
import { promptConfirm, promptSelect } from '../utils/prompts';
import * as security from '../core/security';
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

    // Interactive confirmation skipped if force or dry-run is enabled
    if (!options.force && !options.dryRun) {
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
        let remoteFiles = await listFiles(repoConfig.folderId);

        if (remoteFiles.length === 0) {
            spinner.succeed('Remote repository is empty. Nothing to pull.');
            return;
        }

        // Filter files if specific ones are requested
        if (options.files && options.files.length > 0) {
            const requestedFiles = new Set(options.files);
            remoteFiles = remoteFiles.filter(f => requestedFiles.has(f.name));

            if (remoteFiles.length === 0) {
                spinner.fail('None of the requested files were found in the remote repository.');
                return;
            }
        }

        spinner.succeed(`Found ${remoteFiles.length} file(s) to process.`);
        console.log();

        if (options.dryRun) {
            console.log(chalk.bold.yellow('DRY RUN: The following files would be pulled:'));
            remoteFiles.forEach(f => {
                console.log(` - ${f.name} (${f.size ? formatBytes(parseInt(f.size)) : 'unknown size'})`);
            });
            return;
        }

        let encryptionKey: Buffer | null = null;
        if (repoConfig.encryption) {
            encryptionKey = await security.getEncryptionKey();
        }

        let downloaded = 0;
        let skipped = 0;
        let failed = 0;
        let totalBytes = 0;

        // Simple concurrency control
        const CONCURRENCY_LIMIT = 5;
        const chunks = [];
        for (let i = 0; i < remoteFiles.length; i += CONCURRENCY_LIMIT) {
            chunks.push(remoteFiles.slice(i, i + CONCURRENCY_LIMIT));
        }

        for (const chunk of chunks) {
            await Promise.all(chunk.map(async (file) => {
                const localPath = file.name;

                try {
                    if (pathExists(localPath)) {
                        const localHash = await getFileHash(localPath);

                        if (localHash === file.md5Checksum) {
                            console.log(chalk.gray(`[Skipped] Up to date: ${file.name}`));
                            skipped++;
                            return;
                        }

                        if (options.conflictResolution === 'local') {
                            console.log(chalk.yellow(`[Skipped] Kept local: ${file.name}`));
                            skipped++;
                            return;
                        } else if (options.conflictResolution !== 'remote') {
                            // Note: Prompting inside parallel execution is bad UX. 
                            // For now, if no easy resolution, we skip or force if 'ask' in parallel isn't feasible.
                            // To keep it simple for this "Parallel" feature, we'll default to 'skip' if conflict and no resolution strategy is set,
                            // OR we could force sequential for conflicts. 
                            // Let's assume for bulk pulls, users should use --theirs or --ours or force.
                            // If we really need interaction, we'd have to drop to serial.
                            // For this implementation, we will log a warning and skip if interactive resolution is needed.
                            console.log(chalk.yellow(`[Skipped] Conflict detected for ${file.name}. Run with --theirs, --ours, or manually pull this file to resolve.`));
                            skipped++;
                            return;
                        }
                    }

                    console.log(chalk.cyan(`[Downloading] ${file.name}...`));

                    if (encryptionKey) {
                        const tempPath = path.join(config.GLOBAL_CONFIG_DIR, 'temp_download_' + Math.random().toString(36).slice(2));
                        await downloadFile(file.id, tempPath);

                        try {
                            if (await security.isEncryptedFile(tempPath)) {
                                await security.decryptFile(tempPath, localPath, encryptionKey);
                                console.log(chalk.green(`[Downloaded & Decrypted] ${file.name} (${formatBytes(parseInt(file.size || '0'))})`));
                            } else {
                                // Fallback if file on remote isn't encrypted but repo is
                                const { promises: fsPromises } = await import('fs');
                                if (pathExists(localPath)) await fsPromises.unlink(localPath);
                                await fsPromises.copyFile(tempPath, localPath);
                                console.log(chalk.green(`[Downloaded] ${file.name} (${formatBytes(parseInt(file.size || '0'))})` + chalk.yellow(' (Plain text)')));
                            }
                        } finally {
                            const { promises: fsPromises } = await import('fs');
                            if (pathExists(tempPath)) await fsPromises.unlink(tempPath);
                        }
                    } else {
                        await downloadFile(file.id, localPath);
                        console.log(chalk.green(`[Downloaded] ${file.name} (${formatBytes(parseInt(file.size || '0'))})`));
                    }

                    downloaded++;
                } catch (err) {
                    console.error(chalk.red(`[Failed] ${file.name}: ${(err as Error).message}`));
                    failed++;
                }
            }));
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
