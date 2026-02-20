import path from 'path';
import fs from 'fs';
import * as config from '../core/config';
import * as gcpcore from '../core/gcp';
import { readJsonFile, pathExists, getAllFiles, formatBytes, getIgnorePatterns } from '../utils/files';
import { printSuccess, printError, printInfo, createSpinner, chalk } from '../utils/ui';
import { promptConfirm } from '../utils/prompts';

export async function handleGCPList(bucketArg?: string, prefix?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    try {
        const bucket = await gcpcore.resolveBucket(bucketArg);
        const client = await gcpcore.getGCPClientInteractive();

        const ok = await gcpcore.checkBucketAccessible(client, bucket);
        if (!ok) {
            printError('Cannot access bucket — check credentials and bucket name.');
            return;
        }

        const items = await gcpcore.listObjects(bucket, prefix || '', client);

        if (items.length === 0) {
            printInfo('No objects found.');
            return;
        }

        console.log();
        items.forEach((it) => {
            console.log(`  ${chalk.gray(it.size.toString().padStart(8))}  ${chalk.cyan(it.key)}`);
        });
        console.log();
        printSuccess(`Found ${items.length} object(s) in ${bucket}`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleGCPUpload(files: string[], bucketArg?: string): Promise<void> {
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
        const bucket = await gcpcore.resolveBucket(bucketArg);
        const client = await gcpcore.getGCPClientInteractive();

        const ok = await gcpcore.checkBucketAccessible(client, bucket);
        if (!ok) {
            printError('Cannot access bucket — check credentials and bucket name.');
            return;
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

            const key = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
            const spinner = createSpinner(`${progress} Uploading ${chalk.cyan(key)}...`);
            spinner.start();

            try {
                const result = await gcpcore.uploadFile(filePath, key, bucket, client);
                spinner.succeed(
                    `${progress} ${result.action === 'updated' ? chalk.yellow('Updated:') : chalk.green('Created:')} ${key}`
                );

                if (result.action === 'updated') updated++; else uploaded++;
            } catch (err) {
                spinner.fail(`${progress} ${chalk.red('Failed:')} ${filePath} - ${(err as Error).message}`);
                failed++;
            }
        }

        console.log(`\n${chalk.bold.cyan('GCP Upload Summary')}\n${chalk.gray('━'.repeat(40))}`);
        console.log(`  ${chalk.green('+ New files:')}     ${uploaded}`);
        console.log(`  ${chalk.yellow('~ Updated:')}       ${updated}`);
        console.log(`  ${chalk.red('x Failed:')}        ${failed}`);
        console.log(chalk.gray('━'.repeat(40)) + '\n');

        if (failed === 0) printSuccess(`Upload complete — ${uploaded + updated} file(s) uploaded to ${bucket}`);
        else printError(`Upload completed with ${failed} error(s).`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleGCPDownload(keys: string[], bucketArg?: string, outPath?: string): Promise<void> {
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
        const bucket = await gcpcore.resolveBucket(bucketArg);
        const client = await gcpcore.getGCPClientInteractive();

        const ok = await gcpcore.checkBucketAccessible(client, bucket);
        if (!ok) {
            printError('Cannot access bucket — check credentials and bucket name.');
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
                const ok = await gcpcore.downloadFile(bucket, key, dest, client);
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

        if (failed === 0) printSuccess(`Downloaded ${success} object(s) from ${bucket}`);
        else printError(`Download completed with ${failed} error(s).`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleGCPDelete(keys: string[], bucketArg?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    if (!keys || keys.length === 0) {
        printError('No object keys specified to delete.');
        return;
    }

    const confirmed = await promptConfirm(`Delete ${keys.length} object(s) from GCP? This cannot be undone.`);
    if (!confirmed) {
        printInfo('Delete cancelled.');
        return;
    }

    try {
        const bucket = await gcpcore.resolveBucket(bucketArg);
        const client = await gcpcore.getGCPClientInteractive();

        const ok = await gcpcore.checkBucketAccessible(client, bucket);
        if (!ok) {
            printError('Cannot access bucket — check credentials and bucket name.');
            return;
        }

        let deleted = 0;
        let failed = 0;

        for (const key of keys) {
            const spinner = createSpinner(`Deleting ${chalk.cyan(key)}...`);
            spinner.start();

            try {
                const ok = await gcpcore.deleteObject(bucket, key, client);
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

        if (failed === 0) printSuccess(`Deleted ${deleted} object(s) from ${bucket}`);
        else printError(`Delete completed with ${failed} error(s).`);
    } catch (err) {
        printError((err as Error).message);
    }
}

export async function handleGCPSync(direction: 'push' | 'pull' = 'push', bucketArg?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    try {
        const bucket = await gcpcore.resolveBucket(bucketArg);
        const client = await gcpcore.getGCPClientInteractive();

        const ok = await gcpcore.checkBucketAccessible(client, bucket);
        if (!ok) {
            printError('Cannot access bucket — check credentials and bucket name.');
            return;
        }

        if (direction === 'push') {
            const ignorePatterns = await getIgnorePatterns(process.cwd(), config.DEFAULT_IGNORE_PATTERNS);
            const files = await getAllFiles(process.cwd(), process.cwd(), ignorePatterns);
            if (files.length === 0) {
                printInfo('No files to sync.');
                return;
            }

            const confirmed = await promptConfirm(`Upload ${files.length} file(s) to gs://${bucket}?`);
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
                    await gcpcore.uploadFile(src, rel, bucket, client);
                    spinner.succeed(`${chalk.green('Uploaded:')} ${rel}`);
                    uploaded++;
                } catch (err) {
                    spinner.fail(`${chalk.red('Failed:')} ${rel} - ${(err as Error).message}`);
                    failed++;
                }
            }

            if (failed === 0) printSuccess(`Sync complete — ${uploaded} file(s) uploaded to ${bucket}`);
            else printError(`Sync completed with ${failed} error(s).`);
        } else {
            const objects = await gcpcore.listObjects(bucket, '', client);
            if (objects.length === 0) {
                printInfo('No objects to download.');
                return;
            }

            const confirmed = await promptConfirm(`Download ${objects.length} object(s) from gs://${bucket} into current directory?`);
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
                    await gcpcore.downloadFile(bucket, obj.key, dest, client);
                    spinner.succeed(`${chalk.green('Downloaded:')} ${obj.key}`);
                    downloaded++;
                } catch (err) {
                    spinner.fail(`${chalk.red('Failed:')} ${obj.key} - ${(err as Error).message}`);
                    failed++;
                }
            }

            if (failed === 0) printSuccess(`Sync complete — ${downloaded} object(s) downloaded from ${bucket}`);
            else printError(`Sync completed with ${failed} error(s).`);
        }
    } catch (err) {
        printError((err as Error).message);
    }
}
