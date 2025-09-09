import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
    if (!process.env.KV_REST_API_URL) {
        return res.status(500).json({ error: 'KV database connection is not configured.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const config = req.body;
        console.log('Received config to save:', JSON.stringify(config, null, 2));

        if (!config || !config.url || !config.name || !config.iconColor) {
            console.error('Validation failed. Missing required fields.');
            return res.status(400).json({ error: 'Missing required configuration data.' });
        }

        const id = nanoid(8);
        await kv.set(id, config);
        console.log(`Successfully saved config with ID: ${id}`);

        return res.status(200).json({ id });

    } catch (error) {
        console.error('Error in /api/create:', error);
        return res.status(500).json({ error: 'Could not save the PWA configuration.' });
    }
}