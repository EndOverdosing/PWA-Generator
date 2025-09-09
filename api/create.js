import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
    console.log('--- CREATE FUNCTION INITIATED ---');
    
    if (!process.env.KV_REST_API_URL) {
        console.error('CRITICAL: KV_REST_API_URL not found.');
        return res.status(500).json({ error: 'KV database connection is not configured.' });
    }
    console.log('KV credentials found.');

    if (req.method !== 'POST') {
        console.warn('Request rejected: Method was not POST.');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    console.log('Request method is POST.');

    try {
        console.log('Request content-type header:', req.headers['content-type']);
        console.log('Attempting to read request body...');
        
        // Vercel now often requires manual parsing if the helper isn't perfect
        let config;
        if (typeof req.body === 'string' && req.body.length > 0) {
            console.log('Request body is a string, attempting to parse JSON.');
            config = JSON.parse(req.body);
        } else {
             console.log('Request body is already an object (or empty).');
             config = req.body;
        }

        console.log('Received config object:', JSON.stringify(config, null, 2));

        if (!config || !config.url || !config.name || !config.iconColor) {
            console.error('Validation failed. Missing required fields.');
            return res.status(400).json({ error: 'Missing required configuration data.' });
        }
        console.log('Validation passed.');

        const id = nanoid(8);
        console.log(`Generated ID: ${id}. Attempting to save to KV...`);

        await kv.set(id, config);
        console.log('Successfully saved config to KV.');

        console.log('--- CREATE FUNCTION SUCCESS ---');
        return res.status(200).json({ id });

    } catch (error) {
        console.error('--- CREATE FUNCTION FAILED IN CATCH BLOCK ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return res.status(500).json({ error: error.message || 'Could not save the PWA configuration.' });
    }
}