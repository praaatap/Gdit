import * as config from '../core/config';
import { readJsonFile, writeJsonFile, pathExists, getAllFiles, getIgnorePatterns, isIgnored } from '../utils/files';
import { printSuccess, printError, printWarning, printInfo, chalk } from '../utils/ui';

export async function handleAdd(files: string[]): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository. Run "gdit init" first.');
        return;
    }

    const stagePath = config.getStagePath();
    const stage = await readJsonFile<string[]>(stagePath, []);
    const ignorePatterns = await getIgnorePatterns(process.cwd(), config.DEFAULT_IGNORE_PATTERNS);

    let addedCount = 0;
    let skippedCount = 0;

    let filesToAdd = files;
    if (files.length === 1 && files[0] === '.') {
        filesToAdd = await getAllFiles(process.cwd(), process.cwd(), ignorePatterns);
    }

    console.log();

    for (const file of filesToAdd) {
        if (isIgnored(file, ignorePatterns)) {
            console.log(chalk.gray(`  o Ignored: ${file}`));
            skippedCount++;
            continue;
        }

        if (!pathExists(file)) {
            console.log(chalk.yellow(`  ! Not found: ${file}`));
            skippedCount++;
            continue;
        }

        if (!stage.includes(file)) {
            stage.push(file);
            console.log(chalk.green(`  + Staged: ${file}`));
            addedCount++;
        } else {
            console.log(chalk.gray(`  o Already staged: ${file}`));
        }
    }

    await writeJsonFile(stagePath, stage);

    console.log();
    if (addedCount > 0) {
        printSuccess(`Staged ${addedCount} file(s).`);
    } else if (skippedCount > 0) {
        printInfo('No new files to stage.');
    } else {
        printInfo('No files to stage.');
    }
}

export async function handleRm(files: string[]): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const stagePath = config.getStagePath();
    let stage = await readJsonFile<string[]>(stagePath, []);
    let removedCount = 0;

    console.log();

    if (files.length === 1 && files[0] === '.') {
        removedCount = stage.length;
        for (const file of stage) {
            console.log(chalk.red(`  - Unstaged: ${file}`));
        }
        stage = [];
    } else {
        stage = stage.filter((stagedFile) => {
            const shouldRemove = files.includes(stagedFile);
            if (shouldRemove) {
                console.log(chalk.red(`  - Unstaged: ${stagedFile}`));
                removedCount++;
            }
            return !shouldRemove;
        });
    }

    if (removedCount > 0) {
        await writeJsonFile(stagePath, stage);
        console.log();
        printSuccess(`Removed ${removedCount} file(s) from the stage.`);
    } else {
        console.log();
        printInfo('No matching files found in the stage.');
    }
}

export async function handleReset(files: string[]): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    if (files.length === 0) {
        await writeJsonFile(config.getStagePath(), []);
        printSuccess('Stage cleared. All files unstaged.');
    } else {
        await handleRm(files);
    }
}
