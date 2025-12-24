import chalk from 'chalk';
import boxen from 'boxen';
import ora, { Ora } from 'ora';

export const printSuccess = (msg: string): void => {
    console.log(
        boxen(chalk.green.bold(`✓ ${msg}`), {
            padding: 1,
            borderColor: 'green',
            borderStyle: 'round',
            margin: 1,
        })
    );
};

export const printError = (msg: string): void => {
    console.log(
        boxen(chalk.red.bold(`✗ ${msg}`), {
            padding: 1,
            borderColor: 'red',
            borderStyle: 'round',
            margin: 1,
        })
    );
};

export const printInfo = (msg: string): void => {
    console.log(
        boxen(chalk.cyan.bold(`i ${msg}`), {
            padding: 1,
            borderColor: 'cyan',
            borderStyle: 'round',
            margin: 1,
        })
    );
};

export const printWarning = (msg: string): void => {
    console.log(
        boxen(chalk.yellow.bold(`! ${msg}`), {
            padding: 1,
            borderColor: 'yellow',
            borderStyle: 'round',
            margin: 1,
        })
    );
};

export const createSpinner = (text: string): Ora => {
    return ora({
        text: chalk.blue(text),
        spinner: 'dots12',
        color: 'cyan',
    });
};

export const printHeader = (title: string): void => {
    console.log('\n' + chalk.bold.magenta('━'.repeat(50)));
    console.log(chalk.bold.magenta(`  ${title}`));
    console.log(chalk.bold.magenta('━'.repeat(50)) + '\n');
};

export const printKeyValue = (key: string, value: string): void => {
    console.log(`  ${chalk.cyan(key.padEnd(15))} ${value}`);
};

export const printListItem = (item: string, type: 'added' | 'removed' | 'modified' | 'default' = 'default'): void => {
    const icons: Record<string, string> = {
        added: chalk.green('  + '),
        removed: chalk.red('  - '),
        modified: chalk.yellow('  ~ '),
        default: chalk.gray('  • '),
    };
    console.log(`${icons[type]}${item}`);
};

export const printDivider = (length: number = 40): void => {
    console.log(chalk.gray('─'.repeat(length)));
};

export const printNewLine = (): void => {
    console.log();
};

export { chalk };
