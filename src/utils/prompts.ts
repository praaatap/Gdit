import readline from 'readline';
import { chalk } from './ui';

const createReadlineInterface = (): readline.Interface => {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
};

export const promptInput = (query: string): Promise<string> => {
    const rl = createReadlineInterface();

    return new Promise((resolve) => {
        rl.question(chalk.magenta(`\n> ${query}`), (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
};

export const promptConfirm = async (query: string, defaultNo: boolean = true): Promise<boolean> => {
    const hint = defaultNo ? '(y/N)' : '(Y/n)';
    const answer = await promptInput(`${query} ${chalk.gray(hint)}: `);

    if (defaultNo) {
        return answer.toLowerCase() === 'y';
    }
    return answer.toLowerCase() !== 'n';
};

export interface SelectChoice {
    index: number;
    value: string;
}

export const promptSelect = async (query: string, options: string[]): Promise<SelectChoice | null> => {
    console.log(chalk.magenta(`\n> ${query}`));

    options.forEach((opt, i) => {
        console.log(chalk.gray(`  ${i + 1}. `) + opt);
    });

    const answer = await promptInput(`Enter number (1-${options.length}): `);
    const index = parseInt(answer, 10) - 1;

    if (index >= 0 && index < options.length) {
        return { index, value: options[index] };
    }
    return null;
};

export const promptPassword = async (query: string): Promise<string> => {
    return promptInput(query);
};
