export default function handler(req, res) {
    const { url, name, s_name, desc, disp, bg, th, icon } = req.query;

    if (!name || !icon || !url) {
        return res.status(400).json({ error: 'Missing required PWA parameters.' });
    }

    const startUrl = `/?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&s_name=${encodeURIComponent(s_name)}&desc=${encodeURIComponent(desc)}&disp=${encodeURIComponent(disp)}&bg=${encodeURIComponent(bg)}&th=${encodeURIComponent(th)}&icon=${encodeURIComponent(icon)}`;

    const manifest = {
        name: name,
        short_name: s_name || name,
        description: desc || 'A web application.',
        start_url: startUrl,
        display: disp || 'standalone',
        background_color: `#${bg}` || '#FFFFFF',
        theme_color: `#${th}` || '#000000',
        icons: [
            {
                src: icon,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
            }
        ]
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    res.status(200).json(manifest);
}