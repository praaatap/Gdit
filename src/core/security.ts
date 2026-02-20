import crypto from 'crypto';
import path from 'path';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import { GLOBAL_CONFIG_DIR } from './config';
import { readJsonFile, writeJsonFile, pathExists } from '../utils/files';
import { promptPassword } from '../utils/prompts';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;
const MAGIC = Buffer.from('GDIT');

const SECRETS_PATH = path.join(GLOBAL_CONFIG_DIR, 'secrets.json');

export interface Vault {
    salt: string; // hex
    iterations: number;
}

/**
 * Derives a key from a passphrase and salt using scrypt
 */
export async function deriveKey(passphrase: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(passphrase, Buffer.concat([salt, MAGIC]), KEY_LENGTH, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });
}

/**
 * Encrypts a file using AES-256-GCM
 * Format: [MAGIC (4)] [IV (12)] [Data] [Tag (16)]
 */
export async function encryptFile(inputPath: string, outputPath: string, key: Buffer): Promise<void> {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);

    // Prepend Magic and IV
    output.write(MAGIC);
    output.write(iv);

    await pipeline(input, cipher, output);

    // Append Auth Tag
    const tag = cipher.getAuthTag();
    await fs.appendFile(outputPath, tag);
}

/**
 * Decrypts a file using AES-256-GCM
 */
export async function decryptFile(inputPath: string, outputPath: string, key: Buffer): Promise<void> {
    const header_len = MAGIC.length + IV_LENGTH;
    const stats = await fs.stat(inputPath);
    if (stats.size < header_len + TAG_LENGTH) {
        throw new Error('Invalid encrypted file: too small.');
    }

    const fd = await fs.open(inputPath, 'r');

    // Check Magic
    const magic = Buffer.alloc(MAGIC.length);
    await fd.read(magic, 0, MAGIC.length, 0);
    if (!magic.equals(MAGIC)) {
        await fd.close();
        throw new Error('File is not a valid gdit encrypted file.');
    }

    // Read IV
    const iv = Buffer.alloc(IV_LENGTH);
    await fd.read(iv, 0, IV_LENGTH, MAGIC.length);

    // Read Tag (last 16 bytes)
    const tag = Buffer.alloc(TAG_LENGTH);
    await fd.read(tag, 0, TAG_LENGTH, stats.size - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const input = createReadStream(inputPath, { start: header_len, end: stats.size - TAG_LENGTH - 1 });
    const output = createWriteStream(outputPath);

    try {
        await pipeline(input, decipher, output);
    } catch (err) {
        await fd.close();
        throw new Error('Decryption failed (incorrect key or corrupted data).');
    }

    await fd.close();
}

/**
 * Checks if a file has the GDIT encryption magic header
 */
export async function isEncryptedFile(filePath: string): Promise<boolean> {
    try {
        const fd = await fs.open(filePath, 'r');
        const magic = Buffer.alloc(MAGIC.length);
        await fd.read(magic, 0, MAGIC.length, 0);
        await fd.close();
        return magic.equals(MAGIC);
    } catch {
        return false;
    }
}

/**
 * Gets or creates the encryption vault
 */
export async function getVault(): Promise<Vault> {
    if (pathExists(SECRETS_PATH)) {
        return await readJsonFile<Vault>(SECRETS_PATH, { salt: '', iterations: 0 });
    }

    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const vault: Vault = { salt, iterations: 100000 };
    await writeJsonFile(SECRETS_PATH, vault);
    return vault;
}

/**
 * Interactively gets the encryption key from user
 */
export async function getEncryptionKey(): Promise<Buffer> {
    const passphrase = process.env.GDIT_PASSPHRASE || await promptPassword('Enter encryption passphrase: ');
    if (!passphrase) {
        throw new Error('Passphrase is required for encrypted repositories.');
    }

    const vault = await getVault();
    return await deriveKey(passphrase, Buffer.from(vault.salt, 'hex'));
}
