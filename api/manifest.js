import { kv } from '@vercel/kv';
import { createCanvas } from 'canvas';

function generateIcon(letter, bgColor) {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 280px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter.toUpperCase(), 256, 256);
    return canvas.toDataURL('image/png');
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
        const iconDataUrl = generateIcon(firstLetter, config.iconColor);
        
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