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
    handleS3List,
    handleS3Upload,
    handleS3Download,
    handleS3Delete,
    handleS3Sync,
    handleGCPList,
    handleGCPUpload,
    handleGCPDownload,
    handleGCPDelete,
    handleGCPSync,
    handleAzureList,
    handleAzureUpload,
    handleAzureDownload,
    handleAzureDelete,
    handleAzureSync,
    handleSecurityStatus,
    handleSecurityEnable,
    handleSecurityDisable,
    handleSecurityPurge,
} from './commands';
import { runMcpServer } from './mcp-server';

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

    // S3 command group
    const s3Cmd = program.command('s3').description('S3 Storage commands');

    s3Cmd
        .command('list')
        .description('List objects in an S3 bucket')
        .option('--bucket <bucket>', 'S3 bucket name')
        .option('--prefix <prefix>', 'Key prefix')
        .action((options) => {
            handleS3List(options.bucket, options.prefix);
        });

    s3Cmd
        .command('upload <files...>')
        .description('Upload files to S3')
        .option('--bucket <bucket>', 'S3 bucket name')
        .action((files, options) => {
            handleS3Upload(files, options.bucket);
        });

    s3Cmd
        .command('download <keys...>')
        .description('Download objects from S3')
        .option('--bucket <bucket>', 'S3 bucket name')
        .option('--out <path>', 'Destination folder or file')
        .action((keys, options) => {
            handleS3Download(keys, options.bucket, options.out);
        });

    s3Cmd
        .command('delete <keys...>')
        .description('Delete objects from S3')
        .option('--bucket <bucket>', 'S3 bucket name')
        .action((keys, options) => {
            handleS3Delete(keys, options.bucket);
        });

    s3Cmd
        .command('sync')
        .description('Sync repository with S3 (push|pull)')
        .option('--bucket <bucket>', 'S3 bucket name')
        .option('--direction <direction>', 'push|pull', 'push')
        .action((options) => {
            handleS3Sync(options.direction, options.bucket);
        });

    // GCP command group
    const gcpCmd = program.command('gcp').description('GCP Storage commands');

    gcpCmd
        .command('list')
        .description('List objects in a GCP bucket')
        .option('--bucket <bucket>', 'GCP bucket name')
        .option('--prefix <prefix>', 'Key prefix')
        .action((options) => {
            handleGCPList(options.bucket, options.prefix);
        });

    gcpCmd
        .command('upload <files...>')
        .description('Upload files to GCP Storage')
        .option('--bucket <bucket>', 'GCP bucket name')
        .action((files, options) => {
            handleGCPUpload(files, options.bucket);
        });

    gcpCmd
        .command('download <keys...>')
        .description('Download objects from GCP Storage')
        .option('--bucket <bucket>', 'GCP bucket name')
        .option('--out <path>', 'Destination folder or file')
        .action((keys, options) => {
            handleGCPDownload(keys, options.bucket, options.out);
        });

    gcpCmd
        .command('delete <keys...>')
        .description('Delete objects from GCP Storage')
        .option('--bucket <bucket>', 'GCP bucket name')
        .action((keys, options) => {
            handleGCPDelete(keys, options.bucket);
        });

    gcpCmd
        .command('sync')
        .description('Sync repository with GCP Storage (push|pull)')
        .option('--bucket <bucket>', 'GCP bucket name')
        .option('--direction <direction>', 'push|pull', 'push')
        .action((options) => {
            handleGCPSync(options.direction, options.bucket);
        });

    // Azure command group
    const azureCmd = program.command('azure').description('Azure Blob Storage commands');

    azureCmd
        .command('list')
        .description('List objects in an Azure container')
        .option('--container <container>', 'Azure container name')
        .option('--prefix <prefix>', 'Key prefix')
        .action((options) => {
            handleAzureList(options.container, options.prefix);
        });

    azureCmd
        .command('upload <files...>')
        .description('Upload files to Azure Storage')
        .option('--container <container>', 'Azure container name')
        .action((files, options) => {
            handleAzureUpload(files, options.container);
        });

    azureCmd
        .command('download <keys...>')
        .description('Download objects from Azure Storage')
        .option('--container <container>', 'Azure container name')
        .option('--out <path>', 'Destination folder or file')
        .action((keys, options) => {
            handleAzureDownload(keys, options.container, options.out);
        });

    azureCmd
        .command('delete <keys...>')
        .description('Delete objects from Azure Storage')
        .option('--container <container>', 'Azure container name')
        .action((keys, options) => {
            handleAzureDelete(keys, options.container);
        });

    azureCmd
        .command('sync')
        .description('Sync repository with Azure Storage (push|pull)')
        .option('--container <container>', 'Azure container name')
        .option('--direction <direction>', 'push|pull', 'push')
        .action((options) => {
            handleAzureSync(options.direction, options.container);
        });

    // Security command group
    const securityCmd = program.command('security').description('Manage repository security and encryption');

    securityCmd
        .command('status')
        .description('Show encryption status for the current repository')
        .action(handleSecurityStatus);

    securityCmd
        .command('enable')
        .description('Enable client-side encryption for future uploads')
        .action(handleSecurityEnable);

    securityCmd
        .command('disable')
        .description('Disable client-side encryption')
        .action(handleSecurityDisable);

    securityCmd
        .command('purge')
        .description('PERMANENTLY delete all locally stored credentials and tokens')
        .action(handleSecurityPurge);

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

    program
        .command('mcp')
        .description('Start the MCP server (for IDE/LLM integration)')
        .action(runMcpServer);

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
