import path from 'path';
import fs from 'fs';
import * as config from '../core/config';
import * as azurecore from '../core/azure';
import { readJsonFile, pathExists, getAllFiles, formatBytes, getIgnorePatterns } from '../utils/files';
import { printSuccess, printError, printInfo, createSpinner, chalk } from '../utils/ui';
import { promptConfirm } from '../utils/prompts';
import * as security from '../core/security';
import { RepoConfig } from '../types';

export async function handleAzureList(containerArg?: string, prefix?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    try {
        const container = await azurecore.resolveContainer(containerArg);
        const client = await azurecore.getAzureClientInteractive();

        const ok = await azurecore.checkContainerAccessible(client, container);
        if (!ok) {
            printError('Cannot access container — check credentials and container name.');
            return;
        }

        const items = await azurecore.listObjects(container, prefix || '', client);

        if (items.length === 0) {
            printInfo('No objects found.');
            return;
        }

        console.log();
        items.forEach((it) => {
            console.log(`  ${chalk.gray(it.size.toString().padStart(8))}  ${chalk.cyan(it.key)}`);
        });
        console.log();
        printSuccess(`Found ${items.length} object(s) in ${container}`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleAzureUpload(files: string[], containerArg?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    if (!files || files.length === 0) {
        printError('No files specified to upload.');
        return;
    }

    try {
        const container = await azurecore.resolveContainer(containerArg);
        const client = await azurecore.getAzureClientInteractive();

        const ok = await azurecore.checkContainerAccessible(client, container);
        if (!ok) {
            printError('Cannot access container — check credentials and container name.');
            return;
        }

        const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });
        let encryptionKey: Buffer | null = null;
        if (repoConfig.encryption) {
            encryptionKey = await security.getEncryptionKey();
        }

        let uploaded = 0;
        let updated = 0;
        let failed = 0;

        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            const progress = `[${i + 1}/${files.length}]`;

            if (!pathExists(filePath)) {
                printInfo(`${progress} Skipped (not found): ${filePath}`);
                failed++;
                continue;
            }

            const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
            const spinner = createSpinner(`${progress} Uploading ${chalk.cyan(rel)}...`);
            spinner.start();

            try {
                let uploadPath = filePath;
                let tempPath: string | null = null;

                if (encryptionKey) {
                    tempPath = path.join(config.GLOBAL_CONFIG_DIR, 'temp_azure_up_' + Math.random().toString(36).slice(2));
                    await security.encryptFile(filePath, tempPath, encryptionKey);
                    uploadPath = tempPath;
                }

                const result = await azurecore.uploadFile(uploadPath, rel, container, client);

                if (tempPath && pathExists(tempPath)) {
                    const { promises: fsPromises } = await import('fs');
                    await fsPromises.unlink(tempPath);
                }

                spinner.succeed(
                    `${progress} ${result.action === 'updated' ? chalk.yellow('Updated:') : chalk.green('Created:')} ${rel}${encryptionKey ? chalk.gray(' (Encrypted)') : ''}`
                );

                if (result.action === 'updated') updated++; else uploaded++;
            } catch (err) {
                spinner.fail(`${progress} ${chalk.red('Failed:')} ${filePath} - ${(err as Error).message}`);
                failed++;
            }
        }

        console.log(`\n${chalk.bold.cyan('Azure Upload Summary')}\n${chalk.gray('━'.repeat(40))}`);
        console.log(`  ${chalk.green('+ New files:')}     ${uploaded}`);
        console.log(`  ${chalk.yellow('~ Updated:')}       ${updated}`);
        console.log(`  ${chalk.red('x Failed:')}        ${failed}`);
        console.log(chalk.gray('━'.repeat(40)) + '\n');

        if (failed === 0) printSuccess(`Upload complete — ${uploaded + updated} file(s) uploaded to ${container}`);
        else printError(`Upload completed with ${failed} error(s).`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleAzureDownload(keys: string[], containerArg?: string, outPath?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    if (!keys || keys.length === 0) {
        printError('No object keys specified to download.');
        return;
    }

    try {
        const container = await azurecore.resolveContainer(containerArg);
        const client = await azurecore.getAzureClientInteractive();

        const ok = await azurecore.checkContainerAccessible(client, container);
        if (!ok) {
            printError('Cannot access container — check credentials and container name.');
            return;
        }

        let success = 0;
        let failed = 0;

        for (const key of keys) {
            const dest = outPath
                ? path.join(outPath, path.basename(key))
                : key.replace(/\//g, path.sep);

            const spinner = createSpinner(`Downloading ${chalk.cyan(key)} → ${chalk.gray(dest)}...`);
            spinner.start();

            try {
                const ok = await azurecore.downloadFile(container, key, dest, client);
                if (ok) {
                    spinner.succeed(`${chalk.green('Downloaded:')} ${key}`);
                    success++;
                } else {
                    spinner.fail(`${chalk.red('Failed:')} ${key}`);
                    failed++;
                }
            } catch (err) {
                spinner.fail(`${chalk.red('Failed:')} ${key} - ${(err as Error).message}`);
                failed++;
            }
        }

        if (failed === 0) printSuccess(`Downloaded ${success} object(s) from ${container}`);
        else printError(`Download completed with ${failed} error(s).`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleAzureDelete(keys: string[], containerArg?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    if (!keys || keys.length === 0) {
        printError('No object keys specified to delete.');
        return;
    }

    const confirmed = await promptConfirm(`Delete ${keys.length} object(s) from Azure? This cannot be undone.`);
    if (!confirmed) {
        printInfo('Delete cancelled.');
        return;
    }

    try {
        const container = await azurecore.resolveContainer(containerArg);
        const client = await azurecore.getAzureClientInteractive();

        const ok = await azurecore.checkContainerAccessible(client, container);
        if (!ok) {
            printError('Cannot access container — check credentials and container name.');
            return;
        }

        let deleted = 0;
        let failed = 0;

        for (const key of keys) {
            const spinner = createSpinner(`Deleting ${chalk.cyan(key)}...`);
            spinner.start();

            try {
                const ok = await azurecore.deleteObject(container, key, client);
                if (ok) {
                    spinner.succeed(`${chalk.green('Deleted:')} ${key}`);
                    deleted++;
                } else {
                    spinner.fail(`${chalk.red('Failed:')} ${key}`);
                    failed++;
                }
            } catch (err) {
                spinner.fail(`${chalk.red('Failed:')} ${key} - ${(err as Error).message}`);
                failed++;
            }
        }

        if (failed === 0) printSuccess(`Deleted ${deleted} object(s) from ${container}`);
        else printError(`Delete completed with ${failed} error(s).`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleAzureSync(direction: 'push' | 'pull' = 'push', containerArg?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    try {
        const container = await azurecore.resolveContainer(containerArg);
        const client = await azurecore.getAzureClientInteractive();

        const ok = await azurecore.checkContainerAccessible(client, container);
        if (!ok) {
            printError('Cannot access container — check credentials and container name.');
            return;
        }

        if (direction === 'push') {
            const ignorePatterns = await getIgnorePatterns(process.cwd(), config.DEFAULT_IGNORE_PATTERNS);
            const files = await getAllFiles(process.cwd(), process.cwd(), ignorePatterns);
            if (files.length === 0) {
                printInfo('No files to sync.');
                return;
            }

            const confirmed = await promptConfirm(`Upload ${files.length} file(s) to container ${container}?`);
            if (!confirmed) {
                printInfo('Sync cancelled.');
                return;
            }

            let uploaded = 0;
            let failed = 0;

            for (let i = 0; i < files.length; i++) {
                const rel = files[i];
                const src = path.join(process.cwd(), rel);
                const spinner = createSpinner(`[${i + 1}/${files.length}] ${chalk.cyan(rel)}`);
                spinner.start();

                try {
                    await azurecore.uploadFile(src, rel, container, client);
                    spinner.succeed(`${chalk.green('Uploaded:')} ${rel}`);
                    uploaded++;
                } catch (err) {
                    spinner.fail(`${chalk.red('Failed:')} ${rel} - ${(err as Error).message}`);
                    failed++;
                }
            }

            if (failed === 0) printSuccess(`Sync complete — ${uploaded} file(s) uploaded to ${container}`);
            else printError(`Sync completed with ${failed} error(s).`);
        } else {
            const objects = await azurecore.listObjects(container, '', client);
            if (objects.length === 0) {
                printInfo('No objects to download.');
                return;
            }

            const confirmed = await promptConfirm(`Download ${objects.length} object(s) from container ${container} into current directory?`);
            if (!confirmed) {
                printInfo('Sync cancelled.');
                return;
            }

            let downloaded = 0;
            let failed = 0;

            for (let i = 0; i < objects.length; i++) {
                const obj = objects[i];
                const dest = obj.key.replace(/\//g, path.sep);
                const spinner = createSpinner(`[${i + 1}/${objects.length}] ${chalk.cyan(obj.key)}`);
                spinner.start();

                try {
                    await azurecore.downloadFile(container, obj.key, dest, client);
                    spinner.succeed(`${chalk.green('Downloaded:')} ${obj.key}`);
                    downloaded++;
                } catch (err) {
                    spinner.fail(`${chalk.red('Failed:')} ${obj.key} - ${(err as Error).message}`);
                    failed++;
                }
            }

            if (failed === 0) printSuccess(`Sync complete — ${downloaded} object(s) downloaded from ${container}`);
            else printError(`Sync completed with ${failed} error(s).`);
        }
    } catch (err) {
        printError((err as Error).message);
    }
}
