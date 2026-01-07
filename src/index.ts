#!/usr/bin/env node
import { program } from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import * as config from './core/config';
import { setupCredentials, login } from './core/auth';
import {
    handleInit,
    handleAdd,
    handleRm,
    handleReset,
    handleCommit,
    handleAmend,
    handlePush,
    handleForcePush,
    handlePull,
    handleClone,
    handleStatus,
    handleLog,
    handleDiff,
    handleWhoami,
    handleRemote,
    handleLogout,
    handleHelp,
} from './commands';

async function showBanner(): Promise<void> {
    return new Promise((resolve) => {
        figlet('gdit', { font: 'Standard' }, (err, data) => {
            if (data) {
                console.log(chalk.cyan(data));
                console.log(chalk.gray('  Git-like version control for Google Drive\n'));
            }
            resolve();
        });
    });
}

async function main(): Promise<void> {

    program
        .name('gdit')
        .version(config.VERSION, '-v, --version', 'Show version number')
        .description('Git-like version control for Google Drive')
        .addHelpCommand('help [command]', 'Display help for command')
        .showHelpAfterError(true);

    program
        .command('setup-creds')
        .description('Configure your Google API credentials')
        .action(setupCredentials);

    program
        .command('login')
        .description('Authenticate with your Google account')
        .action(login);

    program
        .command('logout')
        .description('Remove stored authentication tokens')
        .action(handleLogout);

    program
        .command('whoami')
        .description('Show current user information')
        .action(handleWhoami);

    program
        .command('init')
        .description('Initialize a new repository')
        .action(handleInit);

    program
        .command('clone <folderId>')
        .description('Clone an existing Google Drive folder')
        .action(handleClone);

    program
        .command('remote [subcommand]')
        .description('Show remote repository info')
        .action(handleRemote);

    program
        .command('add <files...>')
        .description('Stage files for commit')
        .action(handleAdd);

    program
        .command('rm <files...>')
        .description('Remove files from staging area')
        .action(handleRm);

    program
        .command('reset [files...]')
        .description('Unstage files')
        .action((files?: string[]) => handleReset(files || []));

    program
        .command('commit')
        .description('Commit staged files')
        .requiredOption('-m, --message <message>', 'Commit message')
        .action((options) => handleCommit(options.message));

    program
        .command('amend')
        .description('Amend the last commit message')
        .requiredOption('-m, --message <message>', 'New commit message')
        .action((options) => handleAmend(options.message));

    program
        .command('push')
        .description('Push commits to Google Drive')
        .option('-f, --force', 'Force push all files')
        .action((options) => {
            if (options.force) {
                handleForcePush();
            } else {
                handlePush();
            }
        });

    program
        .command('pull [files...]')
        .description('Pull files from Google Drive')
        .option('-f, --force', 'Force pull without confirmation')
        .option('--theirs', 'Always use remote version')
        .option('--ours', 'Always use local version')
        .option('--dry-run', 'Show what would be pulled without downloading')
        .action((files, options) => {
            handlePull({
                files,
                force: options.force,
                conflictResolution: options.theirs ? 'remote' : options.ours ? 'local' : 'ask',
                dryRun: options.dryRun,
            });
        });

    program
        .command('status')
        .alias('st')
        .description('Show repository status')
        .action(handleStatus);

    program
        .command('log')
        .description('Show commit history')
        .option('-n, --limit <number>', 'Limit commits shown', parseInt)
        .option('--files', 'Show files in each commit')
        .action((options) => {
            handleLog({ limit: options.limit, showFiles: options.files });
        });

    program
        .command('diff')
        .description('Compare local files with remote')
        .action(handleDiff);

    program
        .command('art <text>')
        .description('Generate ASCII art from text')
        .action((text: string) => {
            figlet(text, { font: 'Standard' }, (err, data) => {
                if (data) {
                    console.log(chalk.cyan(data));
                }
            });
        });

    if (process.argv.length <= 2) {
        await showBanner();
        program.help();
        return;
    }

    program.parse(process.argv);
}

//  main function

main().catch((err) => {
    console.error('\nError:', err.message);
    process.exit(1);
});
