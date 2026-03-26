import { Request, Response } from 'express';
import { db } from '../config/database';
import { xrays } from '../models/schema';
import { s3Client } from '../utils/upload';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = process.env.MINIO_BUCKET || 'xrays';

export const uploadXRay = async (req: Request, res: Response) => {
  try {
    const { patientRecordId } = req.body;
    const file = req.file;

    if (!file || !patientRecordId) {
      return res.status(400).json({ error: 'File and patientRecordId are required' });
    }

    const filename = `${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const fileUrl = `http://localhost:9000/${BUCKET_NAME}/${filename}`;

    const [xray] = await db.insert(xrays).values({
      filename,
      url: fileUrl,
      patientRecordId,
    }).returning();

    res.status(201).json({ message: 'Upload successful', xray });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
