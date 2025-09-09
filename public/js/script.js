document.addEventListener('DOMContentLoaded', () => {
    const getEl = (selector) => document.querySelector(selector);
    const themeSwitcher = getEl('#theme-switcher');
    const settingsToggle = getEl('#settings-toggle');
    const settingsContent = getEl('#settings-content');
    const pwaForm = getEl('#pwa-form');
    const shareContainer = getEl('#share-container');
    const websiteUrlInput = getEl('#websiteUrl-input');
    const appNameInput = getEl('#appName');
    const shortNameInput = getEl('#shortName');
    const descriptionInput = getEl('#description');
    const themeColorInput = getEl('#themeColor');
    const backgroundColorInput = getEl('#backgroundColor');
    const displayModeInput = getEl('#displayMode');
    const iconColorInput = getEl('#iconColor');
    const iconPreview = getEl('#iconPreview');
    const themeColorPreview = getEl('#themeColorPreview');
    const backgroundColorPreview = getEl('#backgroundColorPreview');
    const iconColorPreview = getEl('#iconColorPreview');
    const themeColorValue = getEl('#themeColorValue');
    const backgroundColorValue = getEl('#backgroundColorValue');
    const iconColorValue = getEl('#iconColorValue');
    const alertContainer = getEl('#custom-alert-container');
    const toast = getEl('#toast-notification');
    const pwaWrapperView = getEl('#pwa-wrapper-view');
    const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { console.error(e); } };
    const getPreference = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };
    function applyTheme(theme) {
        if (document.body) {
            document.body.classList.toggle('light-theme', theme === 'light');
        }
    }
    function showToast(message) {
        if (!toast) return;
        toast.innerHTML = `<i class="fa-solid fa-check-double"></i> ${message}`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.classList.add('hidden'), 500);
        }, 4000);
    }
    function showCustomAlert(message) {
        if (!alertContainer) return;
        alertContainer.innerHTML = `<div class="custom-alert-card interactive-border"><h3><i class="fa-solid fa-circle-exclamation"></i> Attention</h3><p>${message}</p><button class="custom-alert-close-btn">Okay</button></div>`;
        alertContainer.classList.remove('hidden');
        setTimeout(() => alertContainer.classList.add('visible'), 10);
        const closeBtn = alertContainer.querySelector('.custom-alert-close-btn');
        const alertCard = alertContainer.querySelector('.custom-alert-card');
        const closeAlert = () => {
            alertContainer.classList.remove('visible');
            setTimeout(() => alertContainer.classList.add('hidden'), 300);
        };
        if (closeBtn) closeBtn.onclick = closeAlert;
        alertContainer.onclick = (e) => { if (e.target === alertContainer) closeAlert(); };
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
            if(shareCardP) shareCardP.textContent = 'Your shareable link is ready! Anyone visiting this URL will get your configured PWA.';
            shareContainer.querySelector('.share-card').innerHTML += `<div class="share-link-result"><input type="text" readonly id="share-url-input" value="${shareUrl}"><button class="copy-link-btn" id="copy-link-btn">Copy</button></div>`;
            const copyBtn = getEl('#copy-link-btn');
            if (copyBtn) copyBtn.onclick = () => {
                const shareInput = getEl('#share-url-input');
                if (shareInput) shareInput.select();
                navigator.clipboard.writeText(shareUrl);
                showToast('Link copied to clipboard!');
            };
        } catch (error) {
            console.error("Error generating share link:", error);
            showCustomAlert(`Could not generate the link.<br><br><em>"${error.message}"</em>`);
            if (genButton) {
                genButton.disabled = false;
                genButton.classList.remove('loading');
            }
        }
    }
    function launchPwaWrapper(targetUrl) {
        if (!pwaWrapperView) return;
        pwaWrapperView.classList.remove('hidden');
        const iframe = document.createElement('iframe');
        iframe.id = 'pwa-iframe';
        iframe.src = targetUrl;
        iframe.sandbox = "allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation";
        pwaWrapperView.innerHTML = '';
        pwaWrapperView.appendChild(iframe);
    }
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                }, err => {
                    console.error('ServiceWorker registration failed: ', err);
                });
            });
        }
    }
    async function initializePage() {
        const params = new URLSearchParams(window.location.search);
        const pwaId = params.get('id');
        registerServiceWorker();
        if (pwaId) {
            try {
                document.body.classList.add('pwa-mode');
                const manifestUrl = `/api/manifest?id=${pwaId}`;
                const response = await fetch(manifestUrl);
                if (!response.ok) throw new Error('PWA configuration not found.');
                const manifest = await response.json();
                if (!manifest || !manifest.target_url) {
                    throw new Error('PWA configuration is invalid and missing a target URL.');
                }
                document.title = manifest.name;
                document.body.style.backgroundColor = manifest.background_color;
                const existingManifest = document.querySelector('link[rel="manifest"]');
                if (existingManifest) existingManifest.remove();
                const manifestLink = document.createElement('link');
                manifestLink.rel = 'manifest';
                manifestLink.href = manifestUrl;
                document.head.appendChild(manifestLink);
                launchPwaWrapper(manifest.target_url);
            } catch (error) {
                console.error('PWA Initialization Error:', error.message);
                document.body.innerHTML = `<h1>Error Loading PWA</h1><p>The configuration for this PWA could not be loaded. It may be invalid or expired.</p>`;
            }
        } else {
            setupEventListeners();
            generateAndDisplayIcon();
        }
    }
    function setupEventListeners() {
        if (themeSwitcher) {
            themeSwitcher.onclick = () => {
                let currentTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
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
        if (appNameInput) appNameInput.addEventListener('input', generateAndDisplayIcon);
        if (pwaForm) {
            pwaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!websiteUrlInput.value || !appNameInput.value) {
                    showCustomAlert('Please fill out all required fields, including the URL and App Name.');
                    return;
                }
                if (shareContainer) {
                    shareContainer.classList.remove('hidden');
                    shareContainer.innerHTML = `<div class="share-card interactive-border"><h3><i class="fa-solid fa-wand-magic-sparkles"></i> Share Your PWA</h3><p>Generate a permanent link to share this configured PWA with anyone.</p><button class="generate-link-btn" id="generate-link-btn"><i class="fa-solid fa-share-nodes"></i> Generate Link</button></div>`;
                    const genButton = getEl('#generate-link-btn');
                    if (genButton) genButton.onclick = handleShareLinkGeneration;
                }
            });
        }
        const colorPickerPopup = document.createElement('div');
        colorPickerPopup.className = 'color-picker-popup';
        colorPickerPopup.innerHTML = `<div class="color-picker-sv-panel"><div class="color-picker-thumb"></div></div><input type="range" min="0" max="360" value="0" class="color-picker-hue-slider">`;
        if (document.body) document.body.appendChild(colorPickerPopup);
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
    let currentTheme = getPreference('theme') || 'dark';
    applyTheme(currentTheme);
    initializePage();
});