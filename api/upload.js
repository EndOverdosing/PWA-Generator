import { put } from '@vercel/blob';
import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function streamToBuffer(readableStream) {
    const chunks = [];
    for await (const chunk of readableStream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
        return res.status(500).json({ error: 'Storage connection failed: The BLOB_READ_WRITE_TOKEN is not configured.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const originalFilename = req.query.filename || 'upload';

    try {
        const inputBuffer = await streamToBuffer(req);

        const processedBuffer = await sharp(inputBuffer)
            .resize({
                width: 512,
                height: 512,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .png({ compressionLevel: 9, quality: 80 })
            .toBuffer();

        const fileExtension = '.png';
        const randomString = crypto.randomBytes(8).toString('hex');
        const safeFilename = `${Date.now()}-${randomString}${fileExtension}`;
        
        const blob = await put(safeFilename, processedBuffer, {
            access: 'public',
            contentType: 'image/png',
            token: blobToken,
        });

        return res.status(200).json({ link: blob.url });

    } catch (error) {
        console.error('--- UPLOAD & COMPRESSION FAILED ---');
        console.error('Error Message:', error.message);
        return res.status(500).json({ error: 'Image processing failed. The file may be corrupt or an unsupported format.' });
    }
}