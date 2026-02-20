import path from 'path';
import fs from 'fs';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

import * as config from './config';
import { readJsonFile, writeJsonFile, ensureDir } from '../utils/files';
import { promptInput, promptConfirm } from '../utils/prompts';
import { printSuccess } from '../utils/ui';
import type { RepoConfig } from '../types';

export function buildAzureClient(connectionString?: string): BlobServiceClient {
    if (connectionString) {
        return BlobServiceClient.fromConnectionString(connectionString);
    }
    // Attempt to use DefaultAzureCredential if we decide to install @azure/identity in the future
    // For now we rely on connection strings mostly
    throw new Error('Azure Storage connection string is missing.');
}

export async function getAzureClientInteractive(): Promise<BlobServiceClient> {
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
        return buildAzureClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    }

    const want = await promptConfirm(
        'Azure connection string not found in environment (AZURE_STORAGE_CONNECTION_STRING). Enter connection string now for this session?'
    );
    if (!want) {
        throw new Error('Azure credentials are required to perform this operation.');
    }

    const connectionString = await promptInput('Azure Connection String: ');
    if (!connectionString) {
        throw new Error('Connection string is required.');
    }

    return buildAzureClient(connectionString);
}


export async function resolveContainer(containerArg?: string, cwd: string = process.cwd()): Promise<string> {
    if (containerArg) return containerArg;

    const repoConfig: any = await readJsonFile<RepoConfig>(config.getConfigPath(cwd), { folderId: '' });

    if (repoConfig.azureContainer) return repoConfig.azureContainer;

    const container = await promptInput('Enter Azure Blob Container name to use for this repository: ');
    if (!container) {
        throw new Error('Azure container name is required.');
    }

    const save = await promptConfirm('Save this container to repository config (.gdit/config.json)?', true);
    if (save) {
        repoConfig.azureContainer = container;
        await writeJsonFile(config.getConfigPath(cwd), repoConfig);
        printSuccess(`Azure container saved to ${config.getConfigPath(cwd)}`);
    }

    return container;
}

export async function checkContainerAccessible(client: BlobServiceClient, containerName: string): Promise<boolean> {
    try {
        const containerClient = client.getContainerClient(containerName);
        return await containerClient.exists();
    } catch {
        return false;
    }
}

export async function listObjects(
    containerName: string,
    prefix: string = '',
    client?: BlobServiceClient
): Promise<Array<{ key: string; size: number; lastModified?: string }>> {
    const blobServiceClient = client || buildAzureClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const items: Array<{ key: string; size: number; lastModified?: string }> = [];

    const options = prefix ? { prefix } : {};
    for await (const blob of containerClient.listBlobsFlat(options)) {
        items.push({
            key: blob.name,
            size: blob.properties.contentLength || 0,
            lastModified: blob.properties.lastModified?.toISOString()
        });
    }

    return items;
}

export async function uploadFile(
    localPath: string,
    key: string,
    containerName: string,
    client?: BlobServiceClient
): Promise<{ action: 'created' | 'updated'; key: string }> {
    const blobServiceClient = client || buildAzureClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    let action: 'created' | 'updated' = 'created';
    try {
        if (await blockBlobClient.exists()) action = 'updated';
    } catch {
        action = 'created';
    }

    await blockBlobClient.uploadFile(localPath);

    return { action, key };
}

export async function downloadFile(
    containerName: string,
    key: string,
    destPath: string,
    client?: BlobServiceClient
): Promise<boolean> {
    const blobServiceClient = client || buildAzureClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    await ensureDir(path.dirname(destPath));

    try {
        await blockBlobClient.downloadToFile(destPath);
        return true;
    } catch {
        return false;
    }
}

export async function deleteObject(containerName: string, key: string, client?: BlobServiceClient): Promise<boolean> {
    const blobServiceClient = client || buildAzureClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    try {
        await blockBlobClient.delete();
        return true;
    } catch {
        return false;
    }
}

export default {
    buildAzureClient,
    getAzureClientInteractive,
    resolveContainer,
    checkContainerAccessible,
    listObjects,
    uploadFile,
    downloadFile,
    deleteObject,
};
