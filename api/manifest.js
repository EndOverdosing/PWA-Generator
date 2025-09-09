import { kv } from '@vercel/kv';

function generateIconSvg(letter, bgColor) {
    const svg = `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="${bgColor}"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                  fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="280" font-weight="bold">
                ${letter.toUpperCase()}
            </text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

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

        const firstLetter = (config.name || 'A').trim().charAt(0);
        const iconDataUrl = generateIconSvg(firstLetter, config.iconColor);
        
        const manifest = {
            name: config.name,
            short_name: config.s_name || config.name,
            description: config.desc || 'A web application.',
            scope: '/',
            start_url: `/?id=${id}`,
            display: config.disp || 'standalone',
            background_color: config.bg,
            theme_color: config.th,
            target_url: config.url,
            icons: [
                {
                    src: iconDataUrl,
                    sizes: '512x512',
                    type: 'image/svg+xml',
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