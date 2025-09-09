import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
    if (!process.env.KV_REST_API_URL) {
        return res.status(500).json({ error: 'KV database connection failed: The required environment variables are not configured. Please redeploy the project.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const config = req.body;

        if (!config || !config.url || !config.name || !config.iconColor) {
            return res.status(400).json({ error: 'Missing required configuration data.' });
        }

        const id = nanoid(8);
        await kv.set(id, config);

        return res.status(200).json({ id });

    } catch (error)
        console.error('Error creating PWA config:', error);
        return res.status(500).json({ error: error.message || 'Could not save the PWA configuration.' });
    }
}