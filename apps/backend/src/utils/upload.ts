import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import stream from 'stream';

export const s3Client = new S3Client({
    region: 'us-east-1', // Default for MinIO
    endpoint: 'http://localhost:9000',
    credentials: {
      accessKeyId: process.env.MINIO_ROOT_USER || 'admin',
      secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'password123',
    },
    forcePathStyle: true,
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });
