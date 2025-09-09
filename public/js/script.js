document.addEventListener('DOMContentLoaded', () => {
    const getEl = (selector) => document.querySelector(selector);

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
        }
    }

    function launchPwaMode(pwaId) {
        document.body.classList.add('pwa-mode');

        const initialize = async () => {
            try {
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
                if (pwaWrapperView) {
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
        
        initialize();
    }

    function launchGeneratorMode() {
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
        const themeSwitcher = getEl('#theme-switcher');
        const settingsToggle = getEl('#settings-toggle');
        const settingsContent = getEl('#settings-content');
        const themeColorPreview = getEl('#themeColorPreview');
        const backgroundColorPreview = getEl('#backgroundColorPreview');
        const iconColorPreview = getEl('#iconColorPreview');
        const themeColorValue = getEl('#themeColorValue');
        const backgroundColorValue = getEl('#backgroundColorValue');
        const iconColorValue = getEl('#iconColorValue');

        const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { console.error(e); } };
        const getPreference = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };

        function applyTheme(theme) {
            document.body.classList.toggle('light-theme', theme === 'light');
        }

        let currentTheme = getPreference('theme') || 'dark';
        applyTheme(currentTheme);

        if (themeSwitcher) {
            themeSwitcher.onclick = () => {
                currentTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
                savePreference('theme', currentTheme);
                applyTheme(currentTheme);
            };
        }

        if (settingsToggle) {
            settingsToggle.addEventListener('click', () => {
                settingsToggle.classList.toggle('open');
                if (settingsContent) {
                    settingsContent.classList.toggle('hidden');
                    settingsContent.classList.toggle('visible');
                }
            });
        }
        
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
                if (shareCardP) shareCardP.textContent = 'Your shareable link is ready! Anyone visiting this URL will get your configured PWA.';
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

        function updateColorUI(input, preview, valueSpan) { const color = input.value.toUpperCase(); preview.style.backgroundColor = color; valueSpan.textContent = color; }
        const colorPickerPopup = document.createElement('div');
        colorPickerPopup.className = 'color-picker-popup';
        colorPickerPopup.innerHTML = `<div class="color-picker-sv-panel"><div class="color-picker-thumb"></div></div><input type="range" min="0" max="360" value="0" class="color-picker-hue-slider">`;
        document.body.appendChild(colorPickerPopup);
        const svPanel = colorPickerPopup.querySelector('.color-picker-sv-panel'), thumb = colorPickerPopup.querySelector('.color-picker-thumb'), hueSlider = colorPickerPopup.querySelector('.color-picker-hue-slider');
        let activeColorTarget = null, pickerState = { h: 0, s: 1, v: 1 };
        function hsvToRgb(h, s, v) { let r, g, b, i, f, p, q, t; i = Math.floor(h * 6); f = h * 6 - i; p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s); switch (i % 6) { case 0: r = v, g = t, b = p; break; case 1: r = q, g = v, b = p; break; case 2: r = p, g = v, b = t; break; case 3: r = p, g = q, b = v; break; case 4: r = t, g = p, b = v; break; case 5: r = v, g = p, b = q; break; } return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]; }
        function rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase(); }
        function updatePickerColor() { if (!activeColorTarget) return; const [r, g, b] = hsvToRgb(pickerState.h / 360, pickerState.s, pickerState.v); activeColorTarget.value = rgbToHex(r, g, b); activeColorTarget.dispatchEvent(new Event('input')); }
        function updateSvPanelBackground() { const [r, g, b] = hsvToRgb(pickerState.h / 360, 1, 1); svPanel.style.backgroundColor = `rgb(${r},${g},${b})`; }
        function openColorPicker(input) { activeColorTarget = input; const wrapper = input.closest('.color-picker-wrapper'), rect = wrapper.getBoundingClientRect(); colorPickerPopup.classList.add('visible'); colorPickerPopup.style.top = `${window.scrollY + rect.bottom + 8}px`; colorPickerPopup.style.left = `${window.scrollX + rect.left}px`; pickerState = { h: 0, s: 1, v: 1 }; hueSlider.value = pickerState.h; updateSvPanelBackground(); const svRect = svPanel.getBoundingClientRect(); thumb.style.left = `${pickerState.s * svRect.width}px`; thumb.style.top = `${(1 - pickerState.v) * svRect.height}px`; }
        svPanel.addEventListener('mousedown', (e) => { if (e.button !== 0) return; const onMouseMove = (moveEvent) => { const rect = svPanel.getBoundingClientRect(); let x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left)), y = Math.max(0, Math.min(rect.height, moveEvent.clientY - rect.top)); thumb.style.left = `${x}px`; thumb.style.top = `${y}px`; pickerState.s = x / rect.width; pickerState.v = 1 - (y / rect.height); updatePickerColor(); }; onMouseMove(e); window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', () => window.removeEventListener('mousemove', onMouseMove), { once: true }); });
        hueSlider.addEventListener('input', () => { pickerState.h = hueSlider.value; updateSvPanelBackground(); updatePickerColor(); });
        document.addEventListener('click', (e) => { if (colorPickerPopup.classList.contains('visible') && !colorPickerPopup.contains(e.target) && !e.target.closest('.color-picker-wrapper')) { colorPickerPopup.classList.remove('visible'); activeColorTarget = null; } });
        if (themeColorInput) themeColorInput.addEventListener('input', () => updateColorUI(themeColorInput, themeColorPreview, themeColorValue));
        if (backgroundColorInput) backgroundColorInput.addEventListener('input', () => updateColorUI(backgroundColorInput, backgroundColorPreview, backgroundColorValue));
        if (iconColorInput) iconColorInput.addEventListener('input', () => { updateColorUI(iconColorInput, iconColorPreview, iconColorValue); generateAndDisplayIcon(); });
        updateColorUI(themeColorInput, themeColorPreview, themeColorValue);
        updateColorUI(backgroundColorInput, backgroundColorPreview, backgroundColorValue);
        updateColorUI(iconColorInput, iconColorPreview, iconColorValue);
        [themeColorInput, backgroundColorInput, iconColorInput].forEach(input => { if (!input) return; const wrapper = input.closest('.color-picker-wrapper'); if (wrapper) wrapper.addEventListener('click', () => { if (colorPickerPopup.classList.contains('visible') && activeColorTarget === input) { colorPickerPopup.classList.remove('visible'); activeColorTarget = null; } else { openColorPicker(input); } }); });
    }

    const params = new URLSearchParams(window.location.search);
    const pwaId = params.get('id');
    
    registerServiceWorker();

    if (pwaId) {
        launchPwaMode(pwaId);
    } else {
        launchGeneratorMode();
    }
});