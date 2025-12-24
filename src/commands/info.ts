import figlet from 'figlet';
import * as config from '../core/config';
import { getUserInfo, logout } from '../core/auth';
import { getFolderInfo, getStorageQuota } from '../core/drive';
import { readJsonFile, pathExists, formatBytes } from '../utils/files';
import { printSuccess, printError, printInfo, chalk } from '../utils/ui';
import type { RepoConfig, RemoteInfo } from '../types';

export async function handleWhoami(): Promise<void> {
    const user = await getUserInfo();

    if (!user) {
        printError('Not logged in. Run "gdit login" first.');
        return;
    }

    console.log(`
${chalk.bold.magenta('┌─────────────────────────────────────────────┐')}
${chalk.bold.magenta('│')}  ${chalk.bold.white('Current User')}                               ${chalk.bold.magenta('│')}
${chalk.bold.magenta('└─────────────────────────────────────────────┘')}

  ${chalk.cyan('Name:')}    ${user.name}
  ${chalk.cyan('Email:')}   ${user.email}
`);

    try {
        const quota = await getStorageQuota();
        if (quota && quota.limit > 0) {
            const usagePercent = ((quota.usage / quota.limit) * 100).toFixed(1);
            const barLength = 30;
            const filledLength = Math.round((quota.usage / quota.limit) * barLength);
            const bar = chalk.cyan('█'.repeat(filledLength)) + chalk.gray('░'.repeat(barLength - filledLength));

            console.log(`  ${chalk.cyan('Storage:')} ${bar} ${usagePercent}%`);
            console.log(`           ${formatBytes(quota.usage)} / ${formatBytes(quota.limit)}`);
        }
    } catch {
    }

    console.log();
}

export async function handleRemote(subcommand?: string): Promise<void> {
    const localConfigDir = config.getLocalConfigDir();

    if (!pathExists(localConfigDir)) {
        printError('Not a gdit repository.');
        return;
    }

    const remote = await readJsonFile<RemoteInfo>(config.getRemotePath(), { name: '', folderId: '' });
    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(), { folderId: '' });

    if (subcommand === 'open') {
        if (remote.url) {
            const open = (await import('open')).default;
            await open(remote.url);
            printSuccess('Opened remote folder in browser.');
        } else {
            printError('Remote URL not available.');
        }
        return;
    }

    console.log(`
${chalk.bold.magenta('┌─────────────────────────────────────────────┐')}
${chalk.bold.magenta('│')}  ${chalk.bold.white('Remote Information')}                         ${chalk.bold.magenta('│')}
${chalk.bold.magenta('└─────────────────────────────────────────────┘')}

  ${chalk.cyan('Name:')}       ${remote.name || 'Unknown'}
  ${chalk.cyan('Folder ID:')}  ${repoConfig.folderId || 'Not set'}
  ${chalk.cyan('URL:')}        ${remote.url ? chalk.underline(remote.url) : 'Not available'}
  ${chalk.cyan('Created:')}    ${remote.createdAt ? new Date(remote.createdAt).toLocaleString() : 'Unknown'}
`);

    try {
        const folderInfo = await getFolderInfo(repoConfig.folderId);
        if (folderInfo) {
            console.log(chalk.green('  + Connection verified - folder accessible'));
        }
    } catch {
        console.log(chalk.red('  x Could not verify connection'));
    }

    console.log();
}

export async function handleLogout(): Promise<void> {
    await logout();
}

export async function handleVersion(): Promise<void> {
    return new Promise((resolve) => {
        figlet('gdit', { font: 'Standard' }, (err, data) => {
            if (data) {
                console.log(chalk.cyan(data));
            }

            console.log(`
${chalk.bold.white('Version:')} ${chalk.cyan(config.VERSION)}
${chalk.bold.white('Package:')} ${config.PACKAGE_NAME}
${chalk.gray(config.DESCRIPTION)}

${chalk.gray('GitHub: https://github.com/your-username/gdit')}
${chalk.gray('License: MIT')}
`);
            resolve();
        });
    });
}

export async function handleHelp(): Promise<void> {
    console.log(`
${chalk.bold.cyan('gdit')} - ${chalk.gray('Git-like version control for Google Drive')}

${chalk.bold.yellow('SETUP COMMANDS')}
  ${chalk.cyan('setup-creds')}     Configure Google API credentials
  ${chalk.cyan('login')}           Authenticate with Google
  ${chalk.cyan('logout')}          Remove authentication tokens
  ${chalk.cyan('whoami')}          Show current user info

${chalk.bold.yellow('REPOSITORY COMMANDS')}
  ${chalk.cyan('init')}            Initialize a new repository
  ${chalk.cyan('clone')} ${chalk.gray('<id>')}     Clone a remote Drive folder
  ${chalk.cyan('remote')}          Show remote repository info
  ${chalk.cyan('remote open')}     Open Drive folder in browser

${chalk.bold.yellow('WORKING WITH FILES')}
  ${chalk.cyan('add')} ${chalk.gray('<files>')}    Stage files for commit
  ${chalk.cyan('add .')}           Stage all files
  ${chalk.cyan('rm')} ${chalk.gray('<files>')}     Unstage files
  ${chalk.cyan('reset')}           Clear the staging area

${chalk.bold.yellow('COMMITS & SYNCING')}
  ${chalk.cyan('commit -m')} ${chalk.gray('<msg>')} Commit staged files
  ${chalk.cyan('amend -m')} ${chalk.gray('<msg>')}  Amend last commit message
  ${chalk.cyan('push')}            Push to Google Drive
  ${chalk.cyan('push -f')}         Force push all files
  ${chalk.cyan('pull')}            Download from remote
  ${chalk.cyan('pull --theirs')}   Always use remote version

${chalk.bold.yellow('INFORMATION')}
  ${chalk.cyan('status')}          Show repository status
  ${chalk.cyan('log')}             View commit history
  ${chalk.cyan('log --files')}     Show files in commits
  ${chalk.cyan('diff')}            Compare local vs remote

${chalk.bold.yellow('OPTIONS')}
  ${chalk.cyan('-v, --version')}   Show version
  ${chalk.cyan('-h, --help')}      Show this help

${chalk.gray('Examples:')}
  ${chalk.gray('$')} gdit init
  ${chalk.gray('$')} gdit add .
  ${chalk.gray('$')} gdit commit -m "Initial commit"
  ${chalk.gray('$')} gdit push

${chalk.gray('Documentation: https://github.com/your-username/gdit#readme')}
`);
}
