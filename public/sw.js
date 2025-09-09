self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.pathname === '/manifest.webmanifest') {
        event.respondWith(generateManifest(url.searchParams));
    }
});

async function generateManifest(params) {
    const startUrl = `/?${params.toString()}`;

    const iconSrc = params.get('icon');

    const manifest = {
        name: params.get('name') || 'PWA App',
        short_name: params.get('s_name') || 'PWA App',
        description: params.get('desc') || 'A web application.',
        start_url: startUrl,
        display: params.get('disp') || 'standalone',
        background_color: `#${params.get('bg')}` || '#FFFFFF',
        theme_color: `#${params.get('th')}` || '#000000',
        icons: [
            {
                src: iconSrc,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
            }
        ]
    };

    return new Response(JSON.stringify(manifest), {
        headers: {
            'Content-Type': 'application/manifest+json'
        }
    });
}