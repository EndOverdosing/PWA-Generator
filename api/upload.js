import { put } from '@vercel/blob';
import path from 'path';
import crypto from 'crypto';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
        return res.status(500).json({ error: 'Storage connection failed: The BLOB_READ_WRITE_TOKEN is not configured.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const originalFilename = req.query.filename || 'upload.png';
    
    try {
        const fileExtension = path.extname(originalFilename);
        const randomString = crypto.randomBytes(8).toString('hex');
        const safeFilename = `${Date.now()}-${randomString}${fileExtension}`;
        
        const blob = await put(safeFilename, req, {
            access: 'public',
            contentType: req.headers['content-type'],
            token: blobToken,
        });

        return res.status(200).json({ link: blob.url });

    } catch (error) {
        console.error('--- UPLOAD STREAMING FAILED ---');
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error Message:', error.message);
        
        return res.status(500).json({ error: error.message || 'An unknown error occurred during file upload.' });
    }
}