import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

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
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { files } = await formidableParse(req);
        const imageFile = files.image?.[0];

        if (!imageFile) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const fileData = fs.readFileSync(imageFile.filepath);
        
        const blob = await put(imageFile.originalFilename, fileData, {
            access: 'public',
            contentType: imageFile.mimetype,
        });

        fs.unlinkSync(imageFile.filepath);

        return res.status(200).json({ link: blob.url });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Error processing file upload.' });
    }
}