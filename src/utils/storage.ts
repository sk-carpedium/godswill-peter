import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { logger } from './logger';

/**
 * File Storage Service
 * Supports: AWS S3, Cloudflare R2 (S3-compatible), local fallback
 * Used by: integrations.Core.UploadFile, video upload, report PDF generation, media library
 */

let s3: S3Client | null = null;

function getS3(): S3Client {
  if (s3) return s3;

  if (env.R2_ACCOUNT_ID) {
    // Cloudflare R2 (preferred — cheaper)
    s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
    });
  } else if (env.AWS_ACCESS_KEY_ID) {
    // AWS S3
    s3 = new S3Client({
      region: env.AWS_REGION || 'us-east-1',
      credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY! },
    });
  } else {
    throw new Error('No cloud storage configured. Set R2_ACCOUNT_ID or AWS_ACCESS_KEY_ID in .env');
  }

  return s3;
}

const BUCKET = env.STORAGE_BUCKET || env.R2_BUCKET || env.AWS_S3_BUCKET || 'nexus-social';

export interface UploadResult {
  file_url:   string;
  key:        string;
  bucket:     string;
  size:       number;
  mime_type:  string;
}

/**
 * Upload a file buffer to cloud storage
 * Called by: integrations.Core.UploadFile handler in router.ts
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder = 'uploads'
): Promise<UploadResult> {
  const client = getS3();
  const key    = `${folder}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  await client.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
    ACL:         'public-read' as any,
    Metadata:    { 'uploaded-at': new Date().toISOString() },
  }));

  // Construct public URL
  let file_url: string;
  if (env.R2_ACCOUNT_ID && env.R2_PUBLIC_URL) {
    file_url = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  } else if (env.R2_ACCOUNT_ID) {
    file_url = `https://pub-${env.R2_ACCOUNT_ID}.r2.dev/${key}`;
  } else {
    file_url = `https://${BUCKET}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  logger.info('File uploaded', { key, mimeType, size: buffer.byteLength });
  return { file_url, key, bucket: BUCKET, size: buffer.byteLength, mime_type: mimeType };
}

/**
 * Get a presigned URL for temporary file access
 * Used by: secure document downloads in ClientPortal
 */
export async function getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const client = getS3();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: expiresInSeconds });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  logger.info('File deleted', { key });
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const client = getS3();
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}
