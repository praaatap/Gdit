export interface RepoConfig {
    folderId: string;
    name?: string;
    s3Bucket?: string;
    gcpBucket?: string;
    azureContainer?: string;
    createdAt?: string;
}

export interface RemoteInfo {
    name: string;
    folderId: string;
    url?: string;
    createdAt?: string;
    clonedAt?: string;
}

export interface UserSettings {
    defaultBranch: string;
    colorOutput: boolean;
    verboseLogging: boolean;
    conflictResolution: 'ask' | 'local' | 'remote';
}

export interface FileSnapshot {
    path: string;
    hash: string | null;
    size?: number;
}

export interface Commit {
    id: string;
    message: string;
    files: FileSnapshot[];
    fileCount: number;
    timestamp: string;
    pushed: boolean;
    pushedAt?: string;
    amendedAt?: string;
}

export interface DriveFile {
    id: string;
    name: string;
    md5Checksum?: string;
    mimeType?: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
}

export interface DriveFolder {
    id: string;
    name: string;
    webViewLink?: string;
    createdTime?: string;
    owners?: Array<{ emailAddress: string; displayName: string }>;
}

export interface StorageQuota {
    limit: number;
    usage: number;
    usageInDrive: number;
    usageInDriveTrash: number;
}

export interface UploadResult extends DriveFile {
    action: 'created' | 'updated';
}

export interface FileComparison {
    toUpload: Array<{ path: string; action: 'create' | 'update'; remoteId?: string }>;
    toDownload: Array<{ name: string; id: string }>;
    unchanged: string[];
    localOnly: string[];
    remoteOnly: string[];
}

export interface UserInfo {
    email: string;
    name: string;
    picture?: string;
}

export interface PullOptions {
    force?: boolean;
    conflictResolution?: 'ask' | 'local' | 'remote';
    files?: string[];
    dryRun?: boolean;
}

export interface LogOptions {
    limit?: number;
    showFiles?: boolean;
}

export interface PushOptions {
    force?: boolean;
}

export interface FileInfo {
    exists: boolean;
    size?: number;
    sizeFormatted?: string;
    modified?: Date;
    isDirectory?: boolean;
    isFile?: boolean;
}

export interface OAuthCredentials {
    installed: {
        client_id: string;
        client_secret: string;
        redirect_uris: string[];
    };
}

export interface OAuthTokens {
    access_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
    expiry_date?: number;
}
