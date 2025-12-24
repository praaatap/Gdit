import { google } from 'googleapis';
import type { drive_v3 } from 'googleapis';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { getAuthenticatedClient } from './auth';
import { getFileHash, ensureDir } from '../utils/files';
import type { DriveFile, DriveFolder, StorageQuota, UploadResult, FileComparison } from '../types';

export async function getDriveClient(): Promise<drive_v3.Drive | null> {
    const oAuth2Client = await getAuthenticatedClient();
    if (!oAuth2Client) return null;
    return google.drive({ version: 'v3', auth: oAuth2Client });
}

export async function createFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    const drive = await getDriveClient();
    if (!drive) return null;

    const resource: drive_v3.Schema$File = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
        resource.parents = [parentId];
    }

    const { data } = await drive.files.create({
        requestBody: resource,
        fields: 'id, name, webViewLink',
    });

    return {
        id: data.id || '',
        name: data.name || '',
        webViewLink: data.webViewLink || undefined,
    };
}

export async function getFolderInfo(folderId: string): Promise<DriveFolder | null> {
    const drive = await getDriveClient();
    if (!drive) return null;

    try {
        const { data } = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, webViewLink, createdTime, owners',
        });

        return {
            id: data.id || '',
            name: data.name || '',
            webViewLink: data.webViewLink || undefined,
            createdTime: data.createdTime || undefined,
            owners: data.owners?.map((o) => ({
                emailAddress: o.emailAddress || '',
                displayName: o.displayName || '',
            })),
        };
    } catch {
        return null;
    }
}

export async function listFiles(folderId: string): Promise<DriveFile[]> {
    const drive = await getDriveClient();
    if (!drive) return [];

    const { data } = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, md5Checksum, mimeType, size, modifiedTime, webViewLink)',
        orderBy: 'name',
    });

    return (data.files || []).map((f) => ({
        id: f.id || '',
        name: f.name || '',
        md5Checksum: f.md5Checksum || undefined,
        mimeType: f.mimeType || undefined,
        size: f.size || undefined,
        modifiedTime: f.modifiedTime || undefined,
        webViewLink: f.webViewLink || undefined,
    }));
}

export async function uploadFile(localPath: string, folderId: string, existingFileId?: string): Promise<UploadResult | null> {
    const drive = await getDriveClient();
    if (!drive) return null;

    const fileName = path.basename(localPath);
    const media = { body: createReadStream(localPath) };

    if (existingFileId) {
        const { data } = await drive.files.update({
            fileId: existingFileId,
            media,
            fields: 'id, name, md5Checksum, webViewLink',
        });

        return {
            id: data.id || '',
            name: data.name || '',
            md5Checksum: data.md5Checksum || undefined,
            webViewLink: data.webViewLink || undefined,
            action: 'updated',
        };
    } else {
        const { data } = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media,
            fields: 'id, name, md5Checksum, webViewLink',
        });

        return {
            id: data.id || '',
            name: data.name || '',
            md5Checksum: data.md5Checksum || undefined,
            webViewLink: data.webViewLink || undefined,
            action: 'created',
        };
    }
}

export async function downloadFile(fileId: string, destPath: string): Promise<boolean> {
    const drive = await getDriveClient();
    if (!drive) return false;

    await ensureDir(path.dirname(destPath));

    const dest = createWriteStream(destPath);
    const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
        (res.data as NodeJS.ReadableStream)
            .pipe(dest)
            .on('finish', () => resolve(true))
            .on('error', reject);
    });
}

export async function deleteRemoteFile(fileId: string): Promise<boolean> {
    const drive = await getDriveClient();
    if (!drive) return false;

    try {
        await drive.files.delete({ fileId });
        return true;
    } catch {
        return false;
    }
}

export async function compareFiles(localFiles: string[], folderId: string): Promise<FileComparison> {
    const remoteFiles = await listFiles(folderId);
    const remoteMap = new Map(remoteFiles.map((f) => [f.name, f]));

    const comparison: FileComparison = {
        toUpload: [],
        toDownload: [],
        unchanged: [],
        localOnly: [],
        remoteOnly: [],
    };

    for (const localFile of localFiles) {
        const remoteFile = remoteMap.get(localFile);

        if (!remoteFile) {
            comparison.localOnly.push(localFile);
            comparison.toUpload.push({ path: localFile, action: 'create' });
        } else {
            try {
                const localHash = await getFileHash(localFile);
                if (localHash !== remoteFile.md5Checksum) {
                    comparison.toUpload.push({
                        path: localFile,
                        action: 'update',
                        remoteId: remoteFile.id,
                    });
                } else {
                    comparison.unchanged.push(localFile);
                }
            } catch {
                comparison.toDownload.push({
                    name: remoteFile.name,
                    id: remoteFile.id,
                });
            }
            remoteMap.delete(localFile);
        }
    }

    for (const [name, file] of remoteMap) {
        comparison.remoteOnly.push(name);
        comparison.toDownload.push({ name, id: file.id });
    }

    return comparison;
}

export async function getStorageQuota(): Promise<StorageQuota | null> {
    const drive = await getDriveClient();
    if (!drive) return null;

    try {
        const { data } = await drive.about.get({
            fields: 'storageQuota',
        });

        const quota = data.storageQuota;
        if (!quota) return null;

        return {
            limit: parseInt(quota.limit || '0', 10),
            usage: parseInt(quota.usage || '0', 10),
            usageInDrive: parseInt(quota.usageInDrive || '0', 10),
            usageInDriveTrash: parseInt(quota.usageInDriveTrash || '0', 10),
        };
    } catch {
        return null;
    }
}
