import { Writable } from 'stream';
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
        const base64String = fileData.toString('base64');
        const mimeType = imageFile.mimetype;
        const dataURI = `data:${mimeType};base64,${base64String}`;

        fs.unlinkSync(imageFile.filepath);

        return res.status(200).json({ link: dataURI });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Error processing file upload.' });
    }
}