import * as config from '../core/config';
import { readJsonFile } from '../utils/files';
import { listFiles } from '../core/drive';
import type { RepoConfig } from '../types';
import chalk from 'chalk';
import { printError } from '../utils/ui';

export async function handleListRemote(): Promise<void> {
    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });

    if (!repoConfig.folderId) {
        printError('No remote folder linked. Have you run "gdit init" or "gdit clone"?');
        return;
    }

    try {
        const files = await listFiles(repoConfig.folderId);

        console.log(`\n${chalk.bold.cyan('Remote Files in Drive:')}\n`);

        if (files.length === 0) {
            console.log(chalk.gray('  (Folder is empty)'));
        } else {
            for (const file of files) {
                const sizeStr = file.size ? ` (${(parseInt(file.size) / 1024).toFixed(1)} KB)` : '';
                const typeIcon = file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
                console.log(`  ${typeIcon} ${chalk.yellow(file.name)}${chalk.gray(sizeStr)}`);
            }
        }
        console.log();
    } catch (error: any) {
        printError(`Failed to list remote files: ${error.message}`);
    }
}
