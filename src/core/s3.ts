import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import * as config from './config';
import { readJsonFile, writeJsonFile, ensureDir } from '../utils/files';
import { promptInput, promptConfirm } from '../utils/prompts';
import { printSuccess } from '../utils/ui';
import type { RepoConfig } from '../types';

export function buildS3Client(
    credentials?: { accessKeyId: string; secretAccessKey: string; sessionToken?: string },
    region?: string
): S3Client {
    const clientConfig: any = { region: region || process.env.AWS_REGION || 'us-east-1' };
    if (credentials) clientConfig.credentials = credentials;
    return new S3Client(clientConfig);
}

export async function getS3ClientInteractive(): Promise<S3Client> {
    // prefer environment/SDK default chain
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        return buildS3Client();
    }

    const want = await promptConfirm(
        'AWS credentials not found in environment. Enter credentials now for this session?'
    );
    if (!want) {
        throw new Error('AWS credentials are required to perform this operation.');
    }

    const accessKeyId = await promptInput('AWS Access Key ID: ');
    const secretAccessKey = await promptInput('AWS Secret Access Key: ');
    const sessionToken = await promptInput('AWS Session Token (optional): ');
    const region = await promptInput(`AWS Region (default ${process.env.AWS_REGION || 'us-east-1'}): `);

    if (!accessKeyId || !secretAccessKey) {
        throw new Error('Access Key ID and Secret Access Key are required.');
    }

    return buildS3Client(
        { accessKeyId, secretAccessKey, sessionToken: sessionToken || undefined },
        region || undefined
    );
}

export async function resolveBucket(bucketArg?: string, cwd: string = process.cwd()): Promise<string> {
    if (bucketArg) return bucketArg;

    const repoConfig = await readJsonFile<RepoConfig>(config.getConfigPath(cwd), { folderId: '' });

    if (repoConfig.s3Bucket) return repoConfig.s3Bucket;

    const bucket = await promptInput('Enter S3 bucket name to use for this repository: ');
    if (!bucket) {
        throw new Error('S3 bucket name is required.');
    }

    const save = await promptConfirm('Save this bucket to repository config (.gdit/config.json)?', true);
    if (save) {
        repoConfig.s3Bucket = bucket;
        await writeJsonFile(config.getConfigPath(cwd), repoConfig);
        printSuccess(`S3 bucket saved to ${config.getConfigPath(cwd)}`);
    }

    return bucket;
}

export async function checkBucketAccessible(client: S3Client, bucket: string): Promise<boolean> {
    try {
        await client.send(new HeadBucketCommand({ Bucket: bucket }));
        return true;
    } catch {
        return false;
    }
}

export async function listObjects(
    bucket: string,
    prefix: string = '',
    client?: S3Client
): Promise<Array<{ key: string; size: number; lastModified?: string }>> {
    const s3 = client || buildS3Client();
    const items: Array<{ key: string; size: number; lastModified?: string }> = [];

    let ContinuationToken: string | undefined = undefined;
    do {
        const res: any = await s3.send(
            new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken, MaxKeys: 1000 })
        );

        (res.Contents || []).forEach((c: any) => {
            items.push({ key: c.Key || '', size: c.Size || 0, lastModified: c.LastModified?.toISOString() });
        });

        ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (ContinuationToken);

    return items;
}

export async function uploadFile(
    localPath: string,
    key: string,
    bucket: string,
    client?: S3Client
): Promise<{ action: 'created' | 'updated'; key: string }> {
    const s3 = client || buildS3Client();

    // determine if object exists
    let action: 'created' | 'updated' = 'created';
    try {
        await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        action = 'updated';
    } catch {
        action = 'created';
    }

    const stream = createReadStream(localPath);
    const upload = new Upload({
        client: s3,
        params: { Bucket: bucket, Key: key, Body: stream },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
    });

    // progress events are emitted as 'httpUploadProgress' by lib-storage
    (upload as any).on?.('httpUploadProgress', (_progress: any) => {
        // no-op here; command layer may handle higher-level progress
    });

    await upload.done();

    return { action, key };
}

export async function downloadFile(
    bucket: string,
    key: string,
    destPath: string,
    client?: S3Client
): Promise<boolean> {
    const s3 = client || buildS3Client();

    await ensureDir(path.dirname(destPath));

    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    const body = res.Body as any;
    if (!body) return false;

    const dest = createWriteStream(destPath);
    await pipeline(body, dest);
    return true;
}

export async function deleteObject(bucket: string, key: string, client?: S3Client): Promise<boolean> {
    const s3 = client || buildS3Client();
    try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        return true;
    } catch {
        return false;
    }
}

export default {
    buildS3Client,
    getS3ClientInteractive,
    resolveBucket,
    checkBucketAccessible,
    listObjects,
    uploadFile,
    downloadFile,
    deleteObject,
};
