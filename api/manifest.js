import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'No ID provided.' });
    }

    try {
        const config = await kv.get(id);
        if (!config) {
            return res.status(404).json({ error: 'PWA configuration not found.' });
        }
        
        const manifest = {
            name: config.name,
            short_name: config.s_name || config.name,
            description: config.desc || 'A web application.',
            start_url: `/?id=${id}`,
            display: config.disp || 'standalone',
            background_color: config.bg,
            theme_color: config.th,
            target_url: config.url, // This is the new, crucial line
            icons: [
                {
                    src: config.icon,
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ]
        };

        res.setHeader('Content-Type', 'application/manifest+json');
        res.status(200).json(manifest);

    } catch (error) {
        console.error('Error fetching manifest config:', error);
        return res.status(500).json({ error: 'Could not retrieve manifest configuration.' });
    }
}
