import * as config from '../core/config';
import { readJsonFile, writeJsonFile, pathExists, getFileHash, generateRandomId, getFileInfo } from '../utils/files';
import { printSuccess, printError, printWarning, chalk } from '../utils/ui';
import type { Commit, FileSnapshot } from '../types';

export async function handleCommit(message: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const stagePath = config.getStagePath();
    const commitsPath = config.getCommitsPath();

    const stage = await readJsonFile<string[]>(stagePath, []);

    if (stage.length === 0) {
        printWarning('Nothing to commit. Stage files with "gdit add <files>".');
        return;
    }

    const fileSnapshots: FileSnapshot[] = [];

    for (const file of stage) {
        try {
            const hash = await getFileHash(file);
            const info = await getFileInfo(file);
            fileSnapshots.push({
                path: file,
                hash,
                size: info.size,
            });
        } catch (err) {
            console.log(chalk.yellow(`  ! Warning: Could not hash ${file}`));
            fileSnapshots.push({
                path: file,
                hash: null,
            });
        }
    }

    const commits = await readJsonFile<Commit[]>(commitsPath, []);

    const commit: Commit = {
        id: generateRandomId(4),
        message,
        files: fileSnapshots,
        fileCount: stage.length,
        timestamp: new Date().toISOString(),
        pushed: false,
    };

    commits.push(commit);

    await writeJsonFile(commitsPath, commits);
    await writeJsonFile(stagePath, []);

    console.log(`
${chalk.bold.yellow('Commit Created')}
${chalk.gray('━'.repeat(45))}
  ${chalk.cyan('ID:')}        ${chalk.yellow(commit.id)}
  ${chalk.cyan('Message:')}   ${message}
  ${chalk.cyan('Files:')}     ${stage.length} file(s)
  ${chalk.cyan('Time:')}      ${new Date().toLocaleString()}
${chalk.gray('━'.repeat(45))}
`);

    stage.forEach((file) => {
        console.log(chalk.green(`  + ${file}`));
    });

    console.log();
    printSuccess(`Committed ${stage.length} file(s) [${commit.id}]`);
}

export async function handleAmend(newMessage: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const commitsPath = config.getCommitsPath();
    const commits = await readJsonFile<Commit[]>(commitsPath, []);

    if (commits.length === 0) {
        printError('No commits to amend.');
        return;
    }

    const lastCommit = commits[commits.length - 1];

    if (lastCommit.pushed) {
        printError('Cannot amend a commit that has already been pushed.');
        return;
    }

    lastCommit.message = newMessage;
    lastCommit.amendedAt = new Date().toISOString();

    await writeJsonFile(commitsPath, commits);

    printSuccess(`Amended commit [${lastCommit.id}]: ${newMessage}`);
}
