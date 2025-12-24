import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import http from 'http';
import * as config from './config';
import { readJsonFile, writeJsonFile, ensureDir, pathExists, deleteFile } from '../utils/files';
import { printSuccess, printError, printInfo, chalk } from '../utils/ui';
import { promptInput } from '../utils/prompts';
import type { OAuthCredentials, OAuthTokens, UserInfo } from '../types';

export async function setupCredentials(): Promise<void> {
    printInfo('First, get your Google OAuth 2.0 Credentials.');

    console.log(`
${chalk.bold.cyan('Steps to get your credentials:')}

${chalk.green('1.')} Go to: ${chalk.cyan.underline('https://console.cloud.google.com/apis/credentials')}
${chalk.green('2.')} Create a new project or select an existing one
${chalk.green('3.')} Enable the ${chalk.bold('Google Drive API')} for your project
${chalk.green('4.')} Click ${chalk.bold('+ CREATE CREDENTIALS')} > ${chalk.bold('OAuth client ID')}
${chalk.green('5.')} Set Application type to ${chalk.bold('Desktop app')}
${chalk.green('6.')} Copy the ${chalk.yellow('Client ID')} and ${chalk.yellow('Client Secret')} below
`);

    const clientId = await promptInput('Enter your Client ID: ');
    const clientSecret = await promptInput('Enter your Client Secret: ');

    if (!clientId || !clientSecret) {
        printError('Client ID and Client Secret are required.');
        return;
    }

    const credentials: OAuthCredentials = {
        installed: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uris: [config.REDIRECT_URI],
        },
    };

    await ensureDir(config.GLOBAL_CONFIG_DIR);
    await writeJsonFile(config.GLOBAL_CREDENTIALS_PATH, credentials);

    printSuccess(`Credentials saved to: ${chalk.yellow(config.GLOBAL_CREDENTIALS_PATH)}`);
    console.log(chalk.gray("\nRun 'gdit login' to authenticate with Google.\n"));
}

function isTokenExpired(token: OAuthTokens): boolean {
    if (!token.expiry_date) return false;
    return Date.now() >= token.expiry_date - 60000;
}

export async function getAuthenticatedClient(): Promise<OAuth2Client | null> {
    const credentials = await readJsonFile<OAuthCredentials | null>(
        config.GLOBAL_CREDENTIALS_PATH,
        null
    );

    if (!credentials) {
        printError('Credentials not found. Run "gdit setup-creds" first.');
        return null;
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    const token = await readJsonFile<OAuthTokens | null>(
        config.GLOBAL_TOKEN_PATH,
        null
    );

    if (!token) {
        return null;
    }

    oAuth2Client.setCredentials(token);

    if (isTokenExpired(token)) {
        try {
            const { credentials: newToken } = await oAuth2Client.refreshAccessToken();
            await writeJsonFile(config.GLOBAL_TOKEN_PATH, newToken);
            oAuth2Client.setCredentials(newToken);
        } catch (error) {
            return null;
        }
    }

    return oAuth2Client;
}

export async function login(): Promise<void> {
    const credentials = await readJsonFile<OAuthCredentials | null>(
        config.GLOBAL_CREDENTIALS_PATH,
        null
    );

    if (!credentials) {
        printError('Credentials not found. Run "gdit setup-creds" first.');
        return;
    }

    const { client_secret, client_id } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        config.REDIRECT_URI
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: config.SCOPES,
        prompt: 'consent',
    });

    printInfo('Opening your browser for authentication...');
    console.log(`\nIf it doesn't open automatically, visit:\n${chalk.cyan.underline(authUrl)}\n`);

    const open = (await import('open')).default;
    await open(authUrl);

    return new Promise((resolve) => {
        const server = http
            .createServer(async (req, res) => {
                try {
                    if (req.url && req.url.includes('code=')) {
                        const url = new URL(req.url, config.REDIRECT_URI);
                        const code = url.searchParams.get('code');

                        if (!code) {
                            throw new Error('No authorization code received');
                        }

                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(getSuccessHTML());

                        server.close();

                        const { tokens } = await oAuth2Client.getToken(code);
                        await ensureDir(config.GLOBAL_CONFIG_DIR);
                        await writeJsonFile(config.GLOBAL_TOKEN_PATH, tokens);

                        printSuccess('Successfully logged in! Token stored securely.');
                        resolve();
                    }
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>Authentication failed</h1><p>Please try again.</p>');
                    server.close();
                    printError(`Authentication failed: ${(error as Error).message}`);
                    resolve();
                }
            })
            .listen(config.OAUTH_PORT, () => {
                console.log(chalk.gray(`Waiting for authentication on port ${config.OAUTH_PORT}...`));
            });
    });
}

function getSuccessHTML(): string {
    return `<!DOCTYPE html><html><head><title>gdit - Success</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}.container{text-align:center;background:white;padding:3rem 4rem;border-radius:24px;box-shadow:0 25px 80px rgba(0,0,0,0.3)}.emoji{font-size:5rem;margin-bottom:1.5rem}h1{color:#22c55e;margin-bottom:0.5rem;font-size:2rem}p{color:#666;font-size:1.1rem}.brand{margin-top:2rem;color:#999;font-family:monospace;font-size:1.2rem}</style></head>
<body><div class="container"><div class="emoji">✓</div><h1>Authentication Successful!</h1><p>You can close this window and return to the terminal.</p><div class="brand">gdit</div></div></body></html>`;
}

export async function logout(): Promise<boolean> {
    try {
        if (pathExists(config.GLOBAL_TOKEN_PATH)) {
            await deleteFile(config.GLOBAL_TOKEN_PATH);
            printSuccess('Successfully logged out. Token removed.');
            return true;
        } else {
            printInfo('You are not logged in.');
            return false;
        }
    } catch (error) {
        printError(`Logout failed: ${(error as Error).message}`);
        return false;
    }
}

export async function getUserInfo(): Promise<UserInfo | null> {
    const oAuth2Client = await getAuthenticatedClient();
    if (!oAuth2Client) return null;

    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });

    try {
        const { data } = await oauth2.userinfo.get();
        return {
            email: data.email || '',
            name: data.name || '',
            picture: data.picture || undefined,
        };
    } catch {
        return null;
    }
}
