document.addEventListener('DOMContentLoaded', () => {
    const getEl = (selector) => document.querySelector(selector);

    const setupGeneratorPage = () => {
        const pwaForm = getEl('#pwa-form');
        const appNameInput = getEl('#appName');
        const iconColorInput = getEl('#iconColor');
        const iconPreview = getEl('#iconPreview');
        const websiteUrlInput = getEl('#websiteUrl-input');
        const shortNameInput = getEl('#shortName');
        const descriptionInput = getEl('#description');
        const themeColorInput = getEl('#themeColor');
        const backgroundColorInput = getEl('#backgroundColor');
        const displayModeInput = getEl('#displayMode');
        const shareContainer = getEl('#share-container');

        function generateIcon(letter, bgColor) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
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

        function generateAndDisplayIcon() {
            if (!appNameInput || !iconColorInput || !iconPreview) return;
            const appName = appNameInput.value || 'A';
            const firstLetter = appName.trim().charAt(0) || 'A';
            const iconBgColor = iconColorInput.value;
            const iconDataUrl = generateIcon(firstLetter, iconBgColor);
            iconPreview.src = iconDataUrl;
        }

        async function handleShareLinkGeneration() {
            const genButton = getEl('#generate-link-btn');
            if (genButton) {
                genButton.disabled = true;
                genButton.classList.add('loading');
            }
            try {
                const config = {
                    url: websiteUrlInput.value,
                    name: appNameInput.value,
                    s_name: shortNameInput.value || appNameInput.value,
                    desc: descriptionInput.value,
                    disp: displayModeInput.value,
                    bg: backgroundColorInput.value,
                    th: themeColorInput.value,
                    iconColor: iconColorInput.value
                };
                const response = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Failed to create PWA link.');
                const shareUrl = `${window.location.origin}/?id=${result.id}`;
                if (genButton) genButton.remove();
                const shareCardP = shareContainer.querySelector('p');
                if(shareCardP) shareCardP.textContent = 'Your shareable link is ready! Anyone visiting this URL will get your configured PWA.';
                shareContainer.querySelector('.share-card').innerHTML += `<div class="share-link-result"><input type="text" readonly id="share-url-input" value="${shareUrl}"><button class="copy-link-btn" id="copy-link-btn">Copy</button></div>`;
                const copyBtn = getEl('#copy-link-btn');
                if (copyBtn) copyBtn.onclick = () => {
                    const shareInput = getEl('#share-url-input');
                    if (shareInput) shareInput.select();
                    navigator.clipboard.writeText(shareUrl);
                };
            } catch (error) {
                console.error("Error generating share link:", error);
                if (genButton) {
                    genButton.disabled = false;
                    genButton.classList.remove('loading');
                }
            }
        }

        if (pwaForm) {
            pwaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!websiteUrlInput.value || !appNameInput.value) return;
                if (shareContainer) {
                    shareContainer.classList.remove('hidden');
                    shareContainer.innerHTML = `<div class="share-card interactive-border"><h3><i class="fa-solid fa-wand-magic-sparkles"></i> Share Your PWA</h3><p>Generate a permanent link to share this configured PWA with anyone.</p><button class="generate-link-btn" id="generate-link-btn"><i class="fa-solid fa-share-nodes"></i> Generate Link</button></div>`;
                    const genButton = getEl('#generate-link-btn');
                    if (genButton) genButton.onclick = handleShareLinkGeneration;
                }
            });
        }
        
        if (appNameInput) appNameInput.addEventListener('input', generateAndDisplayIcon);
        if (iconColorInput) iconColorInput.addEventListener('input', generateAndDisplayIcon);
        generateAndDisplayIcon();
    };

    const setupPwaMode = async (pwaId) => {
        try {
            document.body.classList.add('pwa-mode');
            const manifestUrl = `/api/manifest?id=${pwaId}`;
            const response = await fetch(manifestUrl);
            if (!response.ok) throw new Error('PWA configuration not found.');
            const manifest = await response.json();
            if (!manifest || !manifest.target_url) {
                throw new Error('PWA configuration is invalid or missing a target URL.');
            }

            document.title = manifest.name;
            document.body.style.backgroundColor = manifest.background_color;

            const existingManifest = document.querySelector('link[rel="manifest"]');
            if (existingManifest) existingManifest.remove();
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = manifestUrl;
            document.head.appendChild(manifestLink);
            
            const pwaWrapperView = getEl('#pwa-wrapper-view');
            if(pwaWrapperView) {
                pwaWrapperView.classList.remove('hidden');
                const iframe = document.createElement('iframe');
                iframe.id = 'pwa-iframe';
                iframe.src = manifest.target_url;
                iframe.sandbox = "allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation";
                pwaWrapperView.innerHTML = '';
                pwaWrapperView.appendChild(iframe);
            }
        } catch (error) {
            console.error('PWA Initialization Error:', error.message);
            document.body.innerHTML = `<h1>Error Loading PWA</h1><p>The configuration for this PWA could not be loaded. It may be invalid or expired.</p>`;
        }
    };

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
        }
    }

    function initializePage() {
        const params = new URLSearchParams(window.location.search);
        const pwaId = params.get('id');

        registerServiceWorker();

        if (pwaId) {
            setupPwaMode(pwaId);
        } else {
            setupGeneratorPage();
        }
    }

    initializePage();
});