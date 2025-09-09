import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
    api: {
        bodyParser: false,
    },
};

const formidableParse = (req) =>
    new Promise((resolve, reject) => {
        const form = formidable();
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

export default async function handler(req, res) {
    console.log('--- UPLOAD FUNCTION INITIATED ---');

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    console.log('Checking for BLOB_READ_WRITE_TOKEN...');
    if (!blobToken) {
        console.error('CRITICAL ERROR: BLOB_READ_WRITE_TOKEN is not found in process.env.');
        return res.status(500).json({ error: 'Storage connection failed: The BLOB_READ_WRITE_TOKEN is not configured in the server environment.' });
    }
    
    console.log('Token found. Type:', typeof blobToken, '| Length:', blobToken.length);
    console.log('Token starts with:', blobToken.substring(0, 15)); // Should start with 'vercel_blob_rw_'

    if (req.method !== 'POST') {
        console.warn('Request rejected: Method was not POST.');
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        console.log('Parsing incoming form data...');
        const { files } = await formidableParse(req);
        const imageFile = files.image?.[0];

        if (!imageFile) {
            console.error('Form parsing failed: No image file found in the request.');
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        console.log('Successfully parsed file:', imageFile.originalFilename, '| Size:', imageFile.size, 'bytes');

        console.log('Reading file from temporary path:', imageFile.filepath);
        const fileData = fs.readFileSync(imageFile.filepath);
        console.log('File read into buffer successfully.');

        const originalFilename = imageFile.originalFilename || 'upload.png';
        const fileExtension = path.extname(originalFilename);
        const randomString = crypto.randomBytes(8).toString('hex');
        const safeFilename = `${Date.now()}-${randomString}${fileExtension}`;
        console.log('Generated safe filename:', safeFilename);
        
        const options = {
            access: 'public',
            contentType: imageFile.mimetype,
            token: blobToken,
        };

        console.log('Attempting to call Vercel Blob "put" function with options:', {
            access: options.access,
            contentType: options.contentType,
            tokenLength: options.token.length
        });
        
        const blob = await put(safeFilename, fileData, options);

        console.log('Vercel Blob "put" function succeeded. URL:', blob.url);

        console.log('Cleaning up temporary file...');
        fs.unlinkSync(imageFile.filepath);
        console.log('Cleanup complete.');

        console.log('--- UPLOAD FUNCTION SUCCESS ---');
        return res.status(200).json({ link: blob.url });

    } catch (error) {
        console.error('--- UPLOAD FUNCTION FAILED IN CATCH BLOCK ---');
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        
        return res.status(500).json({ error: error.message || 'An unknown error occurred during file upload.' });
    }
}