import path from 'path';
import * as config from '../core/config';
import { getAuthenticatedClient } from '../core/auth';
import { createFolder } from '../core/drive';
import { writeJsonFile, ensureDir, pathExists } from '../utils/files';
import { printSuccess, printError, printWarning, createSpinner, chalk } from '../utils/ui';
import type { RepoConfig, RemoteInfo, Commit } from '../types';

export async function handleInit(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (pathExists(localConfigDir)) {
        printWarning('This directory is already a gdit repository.');
        return;
    }

    const oAuth2Client = await getAuthenticatedClient();
    if (!oAuth2Client) {
        printError('You must be logged in. Run "gdit login" first.');
        return;
    }

    const folderName = path.basename(process.cwd());
    const spinner = createSpinner(`Creating Google Drive folder: "${folderName}"`);
    spinner.start();

    try {
        const folder = await createFolder(folderName);

        if (!folder) {
            spinner.fail('Failed to create Google Drive folder.');
            return;
        }

        await ensureDir(localConfigDir);

        const repoConfig: RepoConfig = {
            folderId: folder.id,
            name: folderName,
            createdAt: new Date().toISOString(),
        };

        const remoteInfo: RemoteInfo = {
            name: folderName,
            folderId: folder.id,
            url: folder.webViewLink,
            createdAt: new Date().toISOString(),
        };

        const emptyStage: string[] = [];
        const emptyCommits: Commit[] = [];

        await writeJsonFile(config.getConfigPath(), repoConfig);
        await writeJsonFile(config.getStagePath(), emptyStage);
        await writeJsonFile(config.getCommitsPath(), emptyCommits);
        await writeJsonFile(config.getRemotePath(), remoteInfo);

        spinner.succeed(chalk.green('Repository initialized successfully!'));

        console.log(`
${chalk.bold.cyan('Repository Details')}
${chalk.gray('━'.repeat(45))}
  ${chalk.yellow('Name:')}       ${folderName}
  ${chalk.yellow('Folder ID:')}  ${chalk.cyan(folder.id)}
  ${chalk.yellow('Drive URL:')}  ${chalk.cyan.underline(folder.webViewLink || 'N/A')}
${chalk.gray('━'.repeat(45))}

${chalk.gray('Next steps:')}
  ${chalk.green('1.')} Add files:    ${chalk.cyan('gdit add <file>')} or ${chalk.cyan('gdit add .')}
  ${chalk.green('2.')} Commit:       ${chalk.cyan('gdit commit -m "message"')}
  ${chalk.green('3.')} Push:         ${chalk.cyan('gdit push')}
`);
    } catch (error) {
        spinner.fail(chalk.red('Failed to initialize repository.'));
        printError((error as Error).message);
    }
}
