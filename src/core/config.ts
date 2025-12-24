import path from 'path';
import os from 'os';
import type { UserSettings } from '../types';

export const VERSION = '3.0.1';
export const PACKAGE_NAME = 'gdit';
export const DESCRIPTION = 'Git-like version control for Google Drive';

export const HOME_DIR = os.homedir();
export const GLOBAL_CONFIG_DIR = path.join(HOME_DIR, '.gdit');
export const GLOBAL_TOKEN_PATH = path.join(GLOBAL_CONFIG_DIR, 'token.json');
export const GLOBAL_CREDENTIALS_PATH = path.join(GLOBAL_CONFIG_DIR, 'credentials.json');
export const GLOBAL_SETTINGS_PATH = path.join(GLOBAL_CONFIG_DIR, 'settings.json');

export const getLocalConfigDir = (cwd: string = process.cwd()): string =>
    path.join(cwd, '.gdit');

export const getConfigPath = (cwd: string = process.cwd()): string =>
    path.join(getLocalConfigDir(cwd), 'config.json');

export const getStagePath = (cwd: string = process.cwd()): string =>
    path.join(getLocalConfigDir(cwd), 'stage.json');

export const getCommitsPath = (cwd: string = process.cwd()): string =>
    path.join(getLocalConfigDir(cwd), 'commits.json');

export const getRemotePath = (cwd: string = process.cwd()): string =>
    path.join(getLocalConfigDir(cwd), 'remote.json');

export const OAUTH_PORT = 5000;
export const REDIRECT_URI = `http://localhost:${OAUTH_PORT}`;

export const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

export const DEFAULT_SETTINGS: UserSettings = {
    defaultBranch: 'main',
    colorOutput: true,
    verboseLogging: false,
    conflictResolution: 'ask',
};

export const DEFAULT_IGNORE_PATTERNS = [
    '.gdit',
    '.git',
    'node_modules',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
];
