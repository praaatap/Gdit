import fs from 'fs/promises';
import { existsSync, statSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { FileInfo } from '../types';

export async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as T;
    } catch {
        return defaultValue;
    }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getFileHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

export function generateRandomId(bytes: number = 4): string {
    return crypto.randomBytes(bytes).toString('hex');
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
    try {
        const stats = await fs.stat(filePath);
        return {
            exists: true,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            modified: stats.mtime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
        };
    } catch {
        return { exists: false };
    }
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
}

export function pathExists(filePath: string): boolean {
    return existsSync(filePath);
}

export async function getAllFiles(dirPath: string, relativeTo: string = dirPath, ignorePatterns: string[] = []): Promise<string[]> {
    const files: string[] = [];

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(relativeTo, fullPath);

            if (shouldIgnore(relativePath, entry.name, ignorePatterns)) {
                continue;
            }

            if (entry.isDirectory()) {
                const subFiles = await getAllFiles(fullPath, relativeTo, ignorePatterns);
                files.push(...subFiles);
            } else {
                files.push(relativePath.replace(/\\/g, '/'));
            }
        }
    } catch {
    }

    return files;
}

function shouldIgnore(relativePath: string, name: string, patterns: string[]): boolean {
    if (name.startsWith('.') || name === 'node_modules') {
        return true;
    }

    const normalizedPath = relativePath.replace(/\\/g, '/');

    for (const pattern of patterns) {
        if (pattern.startsWith('*')) {
            const ext = pattern.slice(1);
            if (normalizedPath.endsWith(ext) || name.endsWith(ext)) {
                return true;
            }
        } else if (normalizedPath === pattern || normalizedPath.includes(pattern) || name === pattern) {
            return true;
        }
    }

    return false;
}

export async function readIgnoreFile(dirPath: string): Promise<string[]> {
    const ignorePath = path.join(dirPath, '.gditignore');

    try {
        const content = await fs.readFile(ignorePath, 'utf-8');
        return content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'));
    } catch {
        return [];
    }
}

export async function deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
}
