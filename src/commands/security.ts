import path from 'path';
import * as config from '../core/config';
import * as security from '../core/security';
import { readJsonFile, writeJsonFile, pathExists } from '../utils/files';
import { printSuccess, printError, printInfo, chalk } from '../utils/ui';
import { promptConfirm, promptPassword } from '../utils/prompts';
import { RepoConfig } from '../types';

export async function handleSecurityStatus(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });

    console.log(`\n${chalk.bold.cyan('Repository Security Status')}\n${chalk.gray('━'.repeat(40))}`);
    console.log(`  ${chalk.white('Encryption:')}    ${repoConfig.encryption ? chalk.green('ENABLED') : chalk.red('DISABLED')}`);
    console.log(chalk.gray('━'.repeat(40)) + '\n');

    if (repoConfig.encryption) {
        printInfo('Files will be encrypted with AES-256-GCM before being uploaded to any cloud provider.');
    } else {
        printInfo('Run "gdit security enable" to enable client-side encryption.');
    }
}

export async function handleSecurityEnable(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });

    if (repoConfig.encryption) {
        printInfo('Encryption is already enabled for this repository.');
        return;
    }

    printWarning('Enabling encryption will start encrypting ALL future uploads.');
    printWarning('Existing remote files will remain unencrypted unless re-uploaded.');

    const confirm = await promptConfirm('Do you want to enable client-side encryption?', true);
    if (!confirm) return;

    repoConfig.encryption = true;
    await writeJsonFile(config.getConfigPath(), repoConfig);

    printSuccess('Encryption ENABLED for this repository.');
    printInfo('Note: You will be prompted for your passphrase during push/upload operations.');
}

export async function handleSecurityDisable(): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();
    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });

    if (!repoConfig.encryption) {
        printInfo('Encryption is not enabled.');
        return;
    }

    const confirm = await promptConfirm('Disable encryption? Future uploads will be in plain text.', false);
    if (!confirm) return;

    repoConfig.encryption = false;
    await writeJsonFile(config.getConfigPath(), repoConfig);

    printSuccess('Encryption DISABLED for this repository.');
}

export async function handleSecurityPurge(): Promise<void> {
    const confirm = await promptConfirm(
        'This will PERMANENTLY delete all locally stored credentials, tokens, and encryption vault info. You will need to login and setup-creds again. Continue?',
        false
    );

    if (!confirm) return;

    try {
        const { promises: fsPromises } = await import('fs');
        if (pathExists(config.GLOBAL_CONFIG_DIR)) {
            // Delete files one by one to avoid issues with standard rimraf not being present
            const files = [
                config.GLOBAL_TOKEN_PATH,
                config.GLOBAL_CREDENTIALS_PATH,
                config.GLOBAL_SETTINGS_PATH,
                path.join(config.GLOBAL_CONFIG_DIR, 'secrets.json'),
            ];

            for (const f of files) {
                if (pathExists(f)) await fsPromises.unlink(f);
            }

            printSuccess('All local credentials and security vault info have been purged.');
        } else {
            printInfo('Global config directory not found.');
        }
    } catch (err) {
        printError(`Failed to purge credentials: ${(err as Error).message}`);
    }
}

function printWarning(msg: string) {
    console.log(`${chalk.yellow('!')} ${msg}`);
}
