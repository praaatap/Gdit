import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';

import * as config from './config';
import { readJsonFile, writeJsonFile, ensureDir } from '../utils/files';
import { promptInput, promptConfirm } from '../utils/prompts';
import { printSuccess } from '../utils/ui';
import type { RepoConfig } from '../types';

export function buildGCPClient(keyFilename?: string): Storage {
    if (keyFilename) {
        return new Storage({ keyFilename });
    }
    return new Storage();
}

export async function getGCPClientInteractive(): Promise<Storage> {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return buildGCPClient();
    }

    const want = await promptConfirm(
        'GCP credentials not found in environment (GOOGLE_APPLICATION_CREDENTIALS). Provide a path to a service account JSON key file?'
    );
    if (!want) {
        throw new Error('GCP credentials are required to perform this operation.');
    }

    const keyFilename = await promptInput('Path to service account JSON key file: ');

    if (!keyFilename || !fs.existsSync(keyFilename)) {
        throw new Error('Valid key file path is required.');
    }

    return buildGCPClient(keyFilename);
}

export async function resolveBucket(bucketArg?: string, cwd: string = process.cwd()): Promise<string> {
    if (bucketArg) return bucketArg;

    const repoConfig: any = await readJsonFile<RepoConfig>(config.getConfigPath(cwd), { folderId: '' });

    if (repoConfig.gcpBucket) return repoConfig.gcpBucket;

    const bucket = await promptInput('Enter GCP bucket name to use for this repository: ');
    if (!bucket) {
        throw new Error('GCP bucket name is required.');
    }

    const save = await promptConfirm('Save this bucket to repository config (.gdit/config.json)?', true);
    if (save) {
        repoConfig.gcpBucket = bucket;
        await writeJsonFile(config.getConfigPath(cwd), repoConfig);
        printSuccess(`GCP bucket saved to ${config.getConfigPath(cwd)}`);
    }

    return bucket;
}

export async function checkBucketAccessible(client: Storage, bucketName: string): Promise<boolean> {
    try {
        const [exists] = await client.bucket(bucketName).exists();
        return exists;
    } catch {
        return false;
    }
}

export async function listObjects(
    bucketName: string,
    prefix: string = '',
    client?: Storage
): Promise<Array<{ key: string; size: number; lastModified?: string }>> {
    const storage = client || buildGCPClient();
    const bucket = storage.bucket(bucketName);

    const [files] = await bucket.getFiles({ prefix });

    return files.map(file => ({
        key: file.name,
        size: parseInt(file.metadata.size as string, 10) || 0,
        lastModified: file.metadata.updated as string
    }));
}

export async function uploadFile(
    localPath: string,
    key: string,
    bucketName: string,
    client?: Storage
): Promise<{ action: 'created' | 'updated'; key: string }> {
    const storage = client || buildGCPClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(key);

    let action: 'created' | 'updated' = 'created';
    try {
        const [exists] = await file.exists();
        if (exists) action = 'updated';
    } catch {
        action = 'created';
    }

    await bucket.upload(localPath, {
        destination: key,
    });

    return { action, key };
}

export async function downloadFile(
    bucketName: string,
    key: string,
    destPath: string,
    client?: Storage
): Promise<boolean> {
    const storage = client || buildGCPClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(key);

    await ensureDir(path.dirname(destPath));

    try {
        await file.download({ destination: destPath });
        return true;
    } catch {
        return false;
    }
}

export async function deleteObject(bucketName: string, key: string, client?: Storage): Promise<boolean> {
    const storage = client || buildGCPClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(key);

    try {
        await file.delete();
        return true;
    } catch {
        return false;
    }
}

export default {
    buildGCPClient,
    getGCPClientInteractive,
    resolveBucket,
    checkBucketAccessible,
    listObjects,
    uploadFile,
    downloadFile,
    deleteObject,
};
